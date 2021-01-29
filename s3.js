const fs = require('fs');
const aws = require('aws-sdk');
const { S3_ACCESS_SECRET, S3_ACCESS_KEY, S3_REGION, S3_BUCKET, S3_SESSION_TOKEN } = require('./env_constants');

aws.config.update({
  secretAccessKey: S3_ACCESS_SECRET,
  accessKeyId: S3_ACCESS_KEY,
  region: S3_REGION,
  sessionToken: S3_SESSION_TOKEN
});

const s3 = new aws.S3();

exports.uploadToS3 = function(source, key) {
  return new Promise((resolve, reject) => {
    fs.readFile(source, function (err, data) {
      if (err) {
        reject(err);
        return;
      }
      const params = {
        Bucket      : S3_BUCKET,
        Key         : key,
        Body        : data
      };

      s3.putObject(params, function(err, data) {
          if (err) {
              reject(err);
              return;
          }
          fs.unlink(source, (err) => {
            if (err) {
              reject(err);
              return;
            }

            resolve();
          });
      });
  });
  });
}

exports.generateGetPresignedUrl = function(key) {
  return s3.getSignedUrl('getObject', {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: 60 * 5
  });
}
