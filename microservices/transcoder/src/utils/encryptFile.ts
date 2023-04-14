var crypto = require('crypto');
var fs = require('fs');

export const encrytpFile = (inputStreamPath) => {
  try {
    var key =
      '14189dc35ae35e75ff31d7502e245cd9bc7803838fbfd5c773cdcd79b8a28bbd';
    var cipher = crypto.createCipher('aes-256-cbc', key);

    var input = fs.createReadStream(inputStreamPath);

    const path = inputStreamPath + '.enc';
    fs.mkdirSync(path, {
      recursive: true,
    });
    var output = fs.createWriteStream(path);

    input.pipe(cipher).pipe(output);

    output.on('finish', async function () {
      console.log('Encrypted file written to disk!');
    });
    return 'done';
  } catch (error) {
    console.log(error);
  }
};
