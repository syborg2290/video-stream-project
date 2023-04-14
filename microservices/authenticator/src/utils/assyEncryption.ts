const crypto = require('crypto');

export function encryptText(plainText: string, publicKey: string) {
  return crypto.publicEncrypt(
    {
      key: Buffer.from(publicKey, 'hex').toString('utf8'),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    // We convert the data string to a buffer
    Buffer.from(plainText),
  );
}

export function decryptText(encryptedText: string, privateKey: string) {
  return crypto.privateDecrypt(
    {
      key: Buffer.from(privateKey, 'hex').toString('utf8'),
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    encryptedText,
  );
}
