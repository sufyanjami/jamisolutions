const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

/**
 * function encrypts given text and returns encrypted object.
 * @param {string} txt 
 */
const encrypt = (txt) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(txt);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv : iv.toString('hex'), encryptedData : encrypted.toString('hex') };
}

/**
 * function decrypts given encrypted object.
 * @param {object} encryptedData : encrypted object
 */
const decrypt = (encryptedData) => {
    let iv = Buffer.from(encryptedData.iv, 'hex');
    let encryptedText = Buffer.from(encryptedData.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = {encrypt, decrypt};