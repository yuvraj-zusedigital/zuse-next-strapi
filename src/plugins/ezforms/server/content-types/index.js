'use strict';

const submission = require('./submission/schema.json');
const recipient = require('./recipient/schema.json');

module.exports = {
  submission: { schema: submission },
  recipient: { schema: recipient },
};
