'use strict';

module.exports = ({ strapi }) => ({
  async send(config, formName, data) {
    const recipients = await strapi.query('plugin::ezforms.recipient').findMany();
    const formattedData = strapi.plugin('ezforms').service('formatData').formatData(data);
    const message = formName !== 'form' ? `${formName} \n ${formattedData}` : formattedData;

    for (const recipient of recipients) {
      try {
        await strapi.plugins['email'].services.email.send({
          to: recipient.email,
          from: config.from,
          subject: config.subject ? config.subject : 'New Contact Form Submission',
          text: message,
        });
      } catch (e) {
        strapi.log.error(e);
      }
    }
  },
});
