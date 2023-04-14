const crypto = require('crypto');

export const generateKeyPair = () => {
  try {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'sect233k1',
      publicKeyEncoding: {
        type: 'spki',
        format: 'der',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'der',
      },
    });
    return { privateKey, publicKey };
  } catch (error) {
    console.log(error);
  }
};

export const sign = (plainData, privateKey) => {
  try {
    const signer = crypto.createSign('sha256');
    signer.update(Buffer.from(plainData));
    signer.end();
    const signature = signer.sign(
      crypto.createPrivateKey({
        key: Buffer.from(privateKey, 'hex'),
        format: 'der',
        type: 'pkcs8',
      }),
    );
    const buff = Buffer.from(signature);
    const base64data = buff.toString('base64');
    return base64data;
  } catch (error) {
    console.log(error);
  }
};

export const verify = (data, publicKey, signature) => {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature);
  } catch (error) {
    console.log(error);
  }
};
