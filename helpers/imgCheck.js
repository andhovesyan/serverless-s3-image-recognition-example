const gm = require('gm');
const fs = require('fs');

async function checkColors(img) {
  return new Promise((resolve, reject) => {
    img.write('tmp.jpeg', (err) => {
      gm('tmp.jpeg').color((e, d) => {
        fs.unlinkSync('tmp.jpeg');
        if (e) {
          reject(e);
        }
        resolve(d);
      });
    });
  });
}

async function isFileValid(file) {
  return new Promise((resolve, reject) => {
    try {
      gm(file).identify(async (err, data) => {
        if (err) {
          reject(err);
        }
        const { size } = data;
        const blankHeight = size.height * .43;
        const blankWidth = size.width;
        const topColors = await checkColors(gm(file).crop(blankWidth, blankHeight, 0, 0));
        const bottomColors = await checkColors(gm(file).crop(blankWidth, blankHeight, 0, size.height * .57));
        const middleColors = await checkColors(gm(file).crop(blankWidth, size.height * 57, 0, size.height * .43));
        resolve(!(topColors === 1 && bottomColors === 1 && middleColors > 100));
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = function (file) {
  return isFileValid(file);
}
