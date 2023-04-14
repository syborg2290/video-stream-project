const S3 = require('aws-sdk/clients/s3'); // no need to install aws-sdk, available without installing for all nodejs lambda functions
const crypto = require('crypto');

const createPresignedUrl = (metaData) => {
  const s3 = new S3({
    credentials: {
      accessKeyId: process.env.aws_access_key_id_qa,
      secretAccessKey: process.env.aws_secret_access_key_qa,
    },
    region: 'us-east-2',
  });

  // metadata can contain additional info send from the client
  const params = {
    Fields: {
      key: crypto.randomBytes(8).toString('hex'), // returns a random string
      'x-amz-meta-title': metaData.title, // setting object metadata, has to be in the form x-amz-meta-yourmetadatakey
    },
    Conditions: [
      ['starts-with', '$Content-Type', 'video/'], // accept only videos
      ['content-length-range', 0, 500000000], // max size in bytes, 500mb
    ],
    Expires: 60, // url expires after 60 seconds
    Bucket: process.env.INTAKE_VIDEO_BUCKET,
  };
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      // we have to promisify s3.createPresignedPost because it does not have a .promise method like other aws sdk methods
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

export const getPreSignedUrl = async (event) => {
  try {
    const data = await createPresignedUrl(JSON.parse(event.body));
    return {
      statusCode: 200,
      body: JSON.stringify({
        data,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};
