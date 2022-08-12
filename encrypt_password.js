const bcrypt = require('bcrypt');
const saltRounds = 4;

const encryptPassword = (password) => {
    let encryptedPssWrd = bcrypt.hash(password, saltRounds)
    return encryptedPssWrd;
}

const checkEncryptedPassword = async ({password, encryptedpw}) => {
    return bcrypt.compare(password, encryptedpw);
}


module.exports = {encryptPassword, checkEncryptedPassword}