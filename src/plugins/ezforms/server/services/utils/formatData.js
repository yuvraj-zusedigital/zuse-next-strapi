'use strict';

const path = require('path');
const fs = require('fs');

module.exports = () => ({
  formatData(data) {
    const filePath = path.join(__dirname, '..', '..', 'email-templete.html');
    let htmlTemplate = fs.readFileSync(filePath, 'utf8');

    for (const key in data) {
      const placeholder = '{{' + key + '}}';
      const value = data[key];
      htmlTemplate = htmlTemplate.replace(new RegExp(placeholder, 'g'), value);
    }
    return htmlTemplate;
  },
});
