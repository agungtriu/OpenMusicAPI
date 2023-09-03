const bcrypt = require('bcrypt');

const saltRound = +process.env.SALT_ROUND || 10;

const encryptPwd = (data) => bcrypt.hashSync(String(data), saltRound);

const decryptPwd = (data, hashPwd) => bcrypt.compareSync(String(data), hashPwd);

module.exports = {
  encryptPwd,
  decryptPwd,
};
