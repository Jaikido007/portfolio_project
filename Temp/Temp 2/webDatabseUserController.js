const chalk = require('chalk');
const client = require('./db');

const checkUsernameExists = (username) => {
    let tableName = 'system_users';
    let columnName = 'username'
    return client.query(
        `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = '${username}'`,
        );
}

const getUsernameAndPassword = ({username}) => {
    let tableName = 'system_users';
    return client.query(
        `SELECT encrypted_password, is_active FROM ${tableName} WHERE username = '${username}'`,
    );
}

const validateUsername = ({username}) => {
    let tableName = 'system_users';
    return client.query(
        `SELECT id, username FROM ${tableName} WHERE username = '${username}'`,
    );
}

// MODULES

module.exports = {
    getUsernameAndPassword,
    checkUsernameExists,
    validateUsername,

}


