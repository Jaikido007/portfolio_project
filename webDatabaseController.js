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
    let tableName = 'system_userpool hall sunderlands';
    let query= `UPDATE "${tableName}" SET (password) = ('${password}') WHERE username = '${username}'`
    console.log(query)
    return client.query(
        `UPDATE "${tableName}" SET password = '${password}' WHERE username = '${username}'`
    );
}

const getSystemUserDetails = () => {
    let tableName = 'system_users';
    let tableName2 = 'user_types';
    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName2}
        ON ${tableName}.user_type = ${tableName2}.id
        ORDER BY ${tableName}.id`
    );
}

const getClaimantUserDetails = (uid) => {
    let tableName = 'claimants';
    let tableName2 = 'appointee';

    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName2}
        ON ${tableName}.appointee2 = ${tableName2}.id
        WHERE ${tableName}.id = ${uid}`,
    );
}

const getAppointeeUserDetails = (uid) => {
    let tableName2 = 'appointee';

    return client.query(
        `SELECT * FROM ${tableName2}  
        WHERE ${tableName2}.id = ${uid}`,
    );
}

const getBankUserDetails = (uid) => {
    let tableName = 'claimants';
    let tableName3 = 'payment_bank_details';

    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName3}
        ON ${tableName}.id = ${tableName3}.customer_id
        WHERE ${tableName}.id = ${uid}`,
    );
}

const getPensionUserDetails = (uid) => {
    let tableName = 'claimants';
    let tableName5 = 'pension_frequency_details';
    let tableName6 = 'pension_types';

    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName5}
        ON ${tableName}.id = ${tableName5}.id
        LEFT JOIN ${tableName6}
        ON ${tableName}.id = ${tableName6}.id
        WHERE ${tableName}.id = ${uid}`,
    );
}

const getPaymentUserHistory = (uid) => {
    let tableName = 'claimants';
    let tableName7 = 'pension_history';
    let tableName8 = 'payment_outcome';

    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName7}
        ON ${tableName}.id = ${tableName7}.id
        LEFT JOIN ${tableName8}
        ON ${tableName}.id = ${tableName8}.id
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

const verifyNino = (nino) => {
    let tableName = 'claimants';
    return client.query(
        `SELECT nino FROM ${tableName}  
        WHERE ${tableName}.nino = '${nino}'`,
    );
}

const verifySecurityDetails = (uid) => {
    let tableName = 'claimants';

    return client.query(
        `SELECT dob, sec_answer1, sec_answer2 FROM ${tableName}  
        WHERE ${tableName}.id = ${uid}`,
    );
}


// MODULES

module.exports = {
    getUsernameAndPassword,
    validateUsername,
    changeUserPW,
    getSystemUserDetails,
    getClaimantUserDetails,
    getAppointeeUserDetails,
    getBankUserDetails,
    getPensionUserDetails,
    getPaymentUserHistory,
    checkUsernameExists,
    insertSystemUser,
    verifyNino,
    verifySecurityDetails,

}
