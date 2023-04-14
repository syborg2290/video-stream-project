//Checking the crypto module
const crypto = require('crypto');

export function decryptCBC(content, ivFromHex, key) {
  try {
    const algorithm = 'aes-256-cbc';

    let iv = Buffer.from(ivFromHex, 'hex');
    let semkey = Buffer.from(key, 'hex');
    let encryptedContent = Buffer.from(content, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, semkey, iv);

    let decryptedData = decipher.update(encryptedContent, 'hex', 'utf-8');

    decryptedData += decipher.final('utf8');

    return { result: decryptedData };
  } catch (error) {
    return { result: null };
  }
}
