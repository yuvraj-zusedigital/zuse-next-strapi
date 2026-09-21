'use strict';

const email = require('./notification-providers/email');
const formatData = require('./utils/formatData');

module.exports = {
  email,
  formatData,
};
