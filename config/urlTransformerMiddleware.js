const replaceCloudFrontWithS3 = require("./functions/urlTransformer");


module.exports = () => {
  return async (ctx, next) => {
    await next();

    if (ctx.response && ctx.response.body) {
      ctx.response.body = replaceCloudFrontWithS3(ctx.response.body);
    }
  };
};
