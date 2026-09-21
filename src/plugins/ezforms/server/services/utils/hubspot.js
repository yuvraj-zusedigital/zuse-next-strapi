'use strict';

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

async function request(method, path, body) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const response = await fetch(`${HUBSPOT_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  return { status: response.status, data };
}

async function findByEmail(email) {
  const { status, data } = await request('POST', '/crm/objects/2026-03/contacts/search', {
    filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
    properties: ['email'],
    limit: 1,
  });
  if (status === 200 && data.results && data.results.length > 0) {
    return data.results[0];
  }
  return null;
}

function buildProperties(formData) {
  const nameParts = (formData.firstName || '').trim().split(/\s+/);
  const props = {
    firstname: nameParts[0] || '',
    email: formData.email || '',
    phone: formData.phoneNumber || '',
    lifecyclestage: 'lead',
    lead_type: 'Website Lead',
    enquiry_message: formData.message || '',
    budget: formData.budget || '',
    how_did_you_hear_about_us: formData.hearAboutUs || '',
    submission_page_url: formData.pageUrl || '',
    form_submission_date: formData.fromSubmitTime || new Date().toISOString(),
    newsletter: formData.getUpdate === 'Yes' ? "True" : "False"
  };

  return props;
}

async function syncContact(formData, logger) {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    logger.warn('[HubSpot] HUBSPOT_ACCESS_TOKEN not set — skipping sync');
    return;
  }

  const properties = buildProperties(formData);
  const existing = await findByEmail(formData.email);

  if (existing) {
    const { status, data } = await request('PATCH', `/crm/objects/2026-03/contacts/${existing.id}`, { properties });
    if (status !== 200) {
      throw new Error(`HubSpot contact update failed [${status}]: ${JSON.stringify(data)}`);
    }
    logger.info(`[HubSpot] Updated contact ${existing.id} for ${formData.email}`);
  } else {
    const { status, data } = await request('POST', '/crm/objects/2026-03/contacts', { properties });
    if (status !== 201) {
      throw new Error(`HubSpot contact create failed [${status}]: ${JSON.stringify(data)}`);
    }
    logger.info(`[HubSpot] Created contact ${data.id} for ${formData.email}`);
  }
}

module.exports = { syncContact };
