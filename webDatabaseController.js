const chalk = require('chalk');
const client = require('./db');

const getUsernameAndPassword = ({username}) => {
    let tableName = 'system_users';
    return client.query(
        `SELECT encrypted_password FROM ${tableName} WHERE username = '${username}'`,
    );
}

const validateUsername = ({username}) => {
    let tableName = 'system_users';
    return client.query(
        `SELECT id, username FROM ${tableName} WHERE username = '${username}'`,
    );
}

const changeUserPW = (username, password) => {
    let tableName = 'system_users';
    let query= `UPDATE "${tableName}" SET (password) = ('${password}') WHERE username = '${username}'`
    console.log(query)
    return client.query(
        `UPDATE "${tableName}" SET password = '${password}' WHERE username = '${username}'`
    );
}

const getSystemUserDetails = (uid) => {
    let tableName = 'system_users';
    let tableName2 = 'user_types';
    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName2}
        ON ${tableName}.user_type = ${tableName2}.id
        WHERE ${tableName}.id = ${uid}`,
    );
}

const getClaimantUserDetails = (uid) => {
    let tableName = 'claimants';
    let tableName2 = 'appointee';
    let tableName3 = 'payment_bank_details';
    let tableName4 = 'claimant_pension_details';
    let tableName5 = 'pension_frequency_details';
    let tableName6 = 'pension_types';
    let tableName7 = 'pension_history';
    let tableName8 = 'payment_outcome';
    let tableName9 = 'security_questions';
    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName2}
        ON ${tableName}.appointee2 = ${tableName2}.id
        LEFT JOIN ${tableName3}
        ON ${tableName}.id = ${tableName3}.customer_id
        LEFT JOIN ${tableName4}
        ON ${tableName}.id = ${tableName4}.claimant_id
        LEFT JOIN ${tableName5}
        ON ${tableName}.id = ${tableName5}.id
        LEFT JOIN ${tableName6}
        ON ${tableName}.id = ${tableName6}.id
        LEFT JOIN ${tableName7}
        ON ${tableName}.id = ${tableName7}.id
        LEFT JOIN ${tableName8}
        ON ${tableName}.id = ${tableName8}.id
        LEFT JOIN ${tableName9}
        ON ${tableName}.id = ${tableName9}.id
        WHERE ${tableName}.id = ${uid}`,
    );
}

const checkUsernameExists = (username) => {
    let tableName = 'system_users';
    let columnName = 'username'
    return client.query(
        `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = '${username}'`,
        );
}

const insertSystemUser  = ({username, email, encryptedpw, usertypeno}) => {
    let tableName = 'system_users';
    return client.query(
        `INSERT INTO ${tableName} (username, email, encrypted_password, user_type) VALUES ('${username}', '${email}', '${encryptedpw}', ${usertypeno})`
    );
}

// MODULES

module.exports = {
    getUsernameAndPassword,
    validateUsername,
    changeUserPW,
    getSystemUserDetails,
    getClaimantUserDetails,
    checkUsernameExists,
    insertSystemUser,

}
