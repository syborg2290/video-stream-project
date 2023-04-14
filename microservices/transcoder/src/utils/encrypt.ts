//Checking the crypto module
const crypto = require('crypto');

export function encryptCBC(content) {
  try {
    const algorithm = 'aes-256-cbc';
   
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(content.key, 'hex'),
      Buffer.from(content.iv, 'hex'),
    );

    // encrypt the message
    // input encoding
    // output encoding
    let encryptedData = cipher.update(content.data, 'utf-8', 'hex');

    encryptedData += cipher.final('hex');

    return {
      encryptedData: encryptedData,
    };
  } catch (error) {
    console.log(error);
  }
}
