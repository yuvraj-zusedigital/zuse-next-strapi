// ./config/functions/urlTransformer.js

const cloudFrontUrl = 'https://d13fy5c8tglk2k.cloudfront.net/';
const s3Url = 'https://zuse-website-live.s3.ap-southeast-2.amazonaws.com/';

const replaceCloudFrontWithS3 = (obj) => {
  if (typeof obj === 'string') {
    return obj.replace(cloudFrontUrl, s3Url);
  } else if (Array.isArray(obj)) {
    return obj.map(item => replaceCloudFrontWithS3(item));
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = replaceCloudFrontWithS3(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

module.exports = replaceCloudFrontWithS3;
 