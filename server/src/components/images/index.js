'use strict';

import Promise from 'bluebird';
const lwip = Promise.promisifyAll(require('lwip'));
Promise.promisifyAll(require('lwip/lib/Image').prototype);
Promise.promisifyAll(require('lwip/lib/Batch').prototype);
const fs = Promise.promisifyAll(require('fs'));
const normalize = require('path').normalize;

export function loadImage(path, options) {
  let imgPath;
  return new Promise((resolve, reject) => {
    return lwip.openAsync(path)
      .then(img => {
        return img.resizeAsync(options.width, options.height);
      })
      .then(img => {
        const index = path.indexOf('uploads');
        const tmpPath = path.slice(index + 7);
        imgPath = normalize(__dirname + '/../../../fs' + options.pathTo + tmpPath);
        return img.writeFileAsync(imgPath);
      })
      .then(() => {
        return fs.unlinkAsync(path);
      })
      .then(() => {
        resolve(imgPath.slice(imgPath.indexOf('fs') - 1));
      })
      .catch(err => reject(err));
  });
}

export function removeImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const path = normalize(__dirname + '/../../..' + imageUrl);
    return fs.unlinkAsync(path)
      .then(() => {
        resolve();
      })
      .catch(err => reject(err));
  });
}
