'use strict';

const sgMail = require('@sendgrid/mail');
const { syncContact } = require('../services/utils/hubspot');

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const hasValidSendgridApiKey = typeof sendgridApiKey === 'string' && sendgridApiKey.startsWith('SG.');

if (hasValidSendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

module.exports = ({ strapi }) => ({
  async index(ctx) {
    function captureHandledError(error, stage) {
      if (!strapi.sentry) {
        return;
      }

      strapi.sentry.withScope((scope) => {
        scope.setTag('plugin', 'ezforms');
        scope.setTag('stage', stage);
        scope.setTag('http.status_code', '500');
        scope.setExtra('url', ctx.url);
        scope.setExtra('method', ctx.method);
        scope.setExtra('formName', ctx.request.body?.formName || ctx.request.body?.formData?.formName || 'form');
        scope.setExtra('email', ctx.request.body?.formData?.email);
        scope.captureException(error);
      });
    }

    function ensureSendgridConfigured() {
      if (hasValidSendgridApiKey) {
        return true;
      }

      const error = new Error('SendGrid API key is missing or invalid.');
      strapi.log.error(error.message);
      captureHandledError(error, 'sendgrid-config');
      ctx.internalServerError('Email service is temporarily unavailable');
      return false;
    }

    function getFirstName(fullName) {
      const nameParts = fullName.trim().split(' ');
      return nameParts[0];
    }

    function extractNames(fullName) {
      const names = fullName.trim().split(/\s+/);
      const firstName = names[0] || '';
      const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
      return { firstName, lastName };
    }

    function modifyJsonData(data) {
      if (data.formData && data.formData.firstName) {
        const fullName = data.formData.firstName.split(' ');
        data.formData.firstName = fullName[0];
        data.formData.lastName = fullName.slice(1).join(' ');
      }
      return JSON.stringify(data, null, 2);
    }

    let filteredUserTrackingData = ctx.request.body.formData.userTrackingData
      .filter((item) =>
        item.totalTimeSpendInSec != '' && item.totalTimeSpendInSec != null &&
        item.pageName != '' && item.pageName != null &&
        item.timeformated != '' && item.timeformated != null
      );

    filteredUserTrackingData = filteredUserTrackingData.map((item, index) => ({
      ...item,
      isOdd: index % 2 !== 0,
    }));

    filteredUserTrackingData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    let previousDate = null;
    filteredUserTrackingData.forEach((entry) => {
      const currentDate = new Date(entry.timestamp).toLocaleDateString();
      entry.newDate = previousDate !== null && currentDate !== previousDate;

      if (entry.totalTimeSpendInSec >= 60) {
        const minutes = Math.floor(entry.totalTimeSpendInSec / 60);
        const seconds = entry.totalTimeSpendInSec % 60;
        entry.totalTimeSpendInSec = `${minutes}:${seconds.toString().padStart(2, '0')} Min`;
      } else {
        entry.totalTimeSpendInSec = `${entry.totalTimeSpendInSec.toString().padStart(2, '0')} Sec.`;
      }

      previousDate = currentDate;
    });

    if (ctx.request.body.formData?.formName == 'sub') {
      if (!ensureSendgridConfigured()) {
        return;
      }

      try {
        await sgMail.send({
          to: 'hello@zusedigital.com',
          from: {
            email: 'hello@zusedigital.com',
            name: 'Zuse Digital',
          },
          bcc: 'zanyar@zusedigital.com',
          templateId: 'd-b56b3ac032354e4e82e9c12f02ef0750',
          subject: 'Subscriber From Submit',
          dynamicTemplateData: {
            firstName: ctx.request.body.formData.firstName,
            email: ctx.request.body.formData.email,
            fromSubmitTime: ctx.request.body.formData.fromSubmitTime,
            screensize: ctx.request.body.formData.screensize,
            device: ctx.request.body.formData.device,
            location: ctx.request.body.formData.location,
            userTrackingData: filteredUserTrackingData,
          },
        });
        await sgMail.send({
          to: ctx.request.body.formData.email,
          from: {
            email: 'hello@zusedigital.com',
            name: 'Zuse Digital',
          },
          bcc: 'zanyar@zusedigital.com',
          templateId: 'd-9a676dca8c7b423eac4a0e020602d368',
          subject: `⚡️ Hi ${getFirstName(ctx.request.body.formData.firstName)}, you have been added to the Zuse Digital subscriber list!`,
          dynamicTemplateData: {
            firstName: ctx.request.body.formData.firstName,
            fname: getFirstName(ctx.request.body.formData.firstName),
          },
        });
        await strapi.query('api::subscriber.subscriber').create({
          data: {
            email: ctx.request.body.formData.email,
            data: ctx.request.body.formData.userTrackingData,
            FirstName: extractNames(ctx.request.body.formData.firstName).firstName,
            LastName: extractNames(ctx.request.body.formData.firstName).lastName,
            Location: ctx.request.body.formData.location,
            device: ctx.request.body.formData.device,
            publishedAt: new Date(),
          },
        });
        return (ctx.body = ctx.request.body.formData);
      } catch (e) {
        strapi.log.error(e);
        captureHandledError(e, 'subscription');
        return ctx.internalServerError('A Whoopsie Happened');
      }
    } else {
      const isInternalTest = ctx.request.body.formData?.email === 'yuvraj@zusedigital.com';

      if (!ensureSendgridConfigured()) {
        return;
      }

      let verification = {};
      const formName = strapi.config.get('plugin::ezforms.enableFormName') ? ctx.request.body.formName : 'form';

      const captchaProviderName = strapi.config.get('plugin::ezforms.captchaProvider.name');
      if (!(captchaProviderName === 'none') && captchaProviderName) {
        verification = await strapi.plugin('ezforms').service(captchaProviderName).validate(ctx.request.body.token);
        if (!verification.valid) {
          strapi.log.error(verification.error);
          if (verification.code === 500) {
            return ctx.internalServerError('There was an error, check Strapi logs for more details. ' + verification.message);
          } else if (verification.code === 400) {
            return ctx.badRequest(verification.message);
          } else {
            return ctx.internalServerError('There was an error');
          }
        }
      }

      const parsedScore = verification.score || '-1';
      if (!isInternalTest) {
        try {
          const contact = await strapi.query('plugin::ezforms.submission').create({
            data: {
              score: parsedScore,
              formName: formName,
              data: ctx.request.body.formData,
              FirstName: extractNames(ctx.request.body.formData.firstName).firstName,
              LastName: extractNames(ctx.request.body.formData.firstName).lastName,
              message: ctx.request.body.formData.message,
              email: ctx.request.body.formData.email,
              phoneNumber: ctx.request.body.formData.phoneNumber,
              Location: ctx.request.body.formData.location,
              device: ctx.request.body.formData.device,
              budget: ctx.request.body.formData.budget,
              hearAboutUs: ctx.request.body.formData.hearAboutUs,
              Stayupdated: ctx.request.body.formData.getUpdate == 'Yes' ? true : false,
            },
          });
          await strapi.query('api::user-tracking.user-tracking').create({
            data: {
              email: ctx.request.body.formData.email,
              data: ctx.request.body.formData.userTrackingData,
              form_submission: contact.id,
              location: ctx.request.body.formData.location,
              device: ctx.request.body.formData.device,
            },
          });
        } catch (e) {
          strapi.log.error(e);
          captureHandledError(e, 'submission-persistence');
          return ctx.internalServerError('A Whoopsie Happened');
        }
      } else {
        strapi.log.info('[ezforms] Internal test email — DB, HubSpot, and notification provider skipped. SendGrid will run in sandbox mode.');
      }

      // DB write is done. Respond to the user now — the rest runs in the
      // background in strict order: HubSpot → SendGrid → notification provider.
      ctx.body = ctx.request.body.formData;

      (async () => {
        if (!isInternalTest) {
          try {
            await syncContact(ctx.request.body.formData, strapi.log);
            strapi.log.info('[HubSpot] Sync OK');
          } catch (e) {
            strapi.log.error('[HubSpot] Sync failed:', e.message);
            captureHandledError(e, 'hubspot-sync');
          }
        }

        try {
          const [internalResp] = await sgMail.send({
            to: 'hello@zusedigital.com',
            from: {
              email: 'hello@zusedigital.com',
              name: 'Zuse Digital',
            },
            bcc: 'zanyar@zusedigital.com',
            templateId: 'd-dd1f47a4d22a42f8b973f7888d5e528f',
            subject: 'Contact From Submit',
            mail_settings: { sandbox_mode: { enable: isInternalTest } },
            dynamicTemplateData: {
              firstName: ctx.request.body.formData.firstName,
              email: ctx.request.body.formData.email,
              phoneNumber: ctx.request.body.formData.phoneNumber,
              message: ctx.request.body.formData.message,
              budget: ctx.request.body.formData.budget,
              hearAboutUs: ctx.request.body.formData.hearAboutUs,
              getUpdate: ctx.request.body.formData.getUpdate,
              fromSubmitTime: ctx.request.body.formData.fromSubmitTime,
              screensize: ctx.request.body.formData.screensize,
              device: ctx.request.body.formData.device,
              location: ctx.request.body.formData.location,
              userTrackingData: filteredUserTrackingData,
            },
          });
          strapi.log.info(`[SendGrid] internal email ${isInternalTest ? '(sandbox)' : ''} status=${internalResp?.statusCode}`);
        } catch (e) {
          strapi.log.error('[SendGrid] internal email failed:', e.message);
          captureHandledError(e, 'sendgrid-internal');
        }

        try {
          const [userResp] = await sgMail.send({
            to: ctx.request.body.formData.email,
            from: {
              email: 'hello@zusedigital.com',
              name: 'Zuse Digital',
            },
            bcc: 'zanyar@zusedigital.com',
            templateId: 'd-c8737fb9cc7a43ce9ed78d2554dc8392',
            subject: `⚡️ Hi ${getFirstName(ctx.request.body.formData.firstName)}, Your Inquiry at Zuse Digital is Received️`,
            mail_settings: { sandbox_mode: { enable: isInternalTest } },
            dynamicTemplateData: {
              firstName: ctx.request.body.formData.firstName,
              fname: getFirstName(ctx.request.body.formData.firstName),
            },
          });
          strapi.log.info(`[SendGrid] user email ${isInternalTest ? '(sandbox)' : ''} status=${userResp?.statusCode}`);
        } catch (e) {
          strapi.log.error('[SendGrid] user email failed:', e.message);
          captureHandledError(e, 'sendgrid-user');
        }

        if (!isInternalTest) {
          const notificationProviders = strapi.config.get('plugin::ezforms.notificationProviders') || [];
          for (const provider of notificationProviders) {
            if (provider.enabled) {
              try {
                await strapi
                  .plugin('ezforms')
                  .service(provider.name)
                  .send(provider.config, formName, modifyJsonData(ctx.request.body.formData));
              } catch (e) {
                strapi.log.error(e);
                captureHandledError(e, 'notification');
              }
            }
          }
        }
      })();
    }
  },
});
