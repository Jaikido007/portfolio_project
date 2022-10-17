const chalk = require('chalk');
const client = require('./db');
const { v4: uuidv4 } = require('uuid');

const checkUsernameExists = (username) => {
    let tableName = 'system_users';
    let columnName = 'username'
    return client.query(
        `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = '${username}'`,
        );
}

const getUsernameAndPassword = ({username}) => {
    let tableName = 'system_users';
    let query = `SELECT encrypted_password, email, is_active FROM ${tableName} WHERE username = '${username}'`
   console.log(query)
    return client.query(
        `SELECT encrypted_password, email, is_active FROM ${tableName} WHERE username = '${username}'`,
    );
}

const validateUsername = ({username}) => {
    let tableName = 'system_users';
    return client.query(
        `SELECT id, username FROM ${tableName} WHERE username = '${username}'`,
    );
}

const initiatePasswordReset = (username) => {
    let tableName = 'system_users'
    let uuid = uuidv4()
    return client.query(
        `UPDATE ${tableName} SET (password_reset, password_guid, password_reset_time) = ('Y', '${uuid}', (to_timestamp(${Date.now()} / 1000.0)))
        WHERE username = '${username}'`
    )
}

const getUUID = (username) => {
    let tableName = 'system_users'
    return client.query(
        `SELECT password_guid FROM ${tableName} WHERE username = '${username}'`
    )
}

const checkUserValidToResetPassword = (cui) => {
    let tableName = 'system_users'
    return client.query(
    `SELECT password_reset FROM ${tableName} WHERE password_guid = '${cui}'`
)
}

const updateEditUserProfile = (email, username) => {
    let tableName = 'system_users'
    return client.query(
        `UPDATE ${tableName} SET email = '${email}'
        WHERE username = '${username}'`
    )    
}

const changeUserPW = (cui, password) => {
    let tableName = 'system_users';
    return client.query(
        `UPDATE "${tableName}" SET (encrypted_password, password_reset, password_guid, password_reset_time) = ('${password}', 'N', NULL, NULL) WHERE password_guid = '${cui}'`
    );
}

const getSystemUserDetails = (username) => {
    let tableName = 'system_users';
    let tableName2 = 'user_types';
    return client.query(
        `SELECT ${tableName}.id, ${tableName}.username, ${tableName}.email, ${tableName}.encrypted_password, ${tableName2}.type, ${tableName}.is_active FROM ${tableName}  
        LEFT JOIN ${tableName2}
        ON ${tableName}.user_type = ${tableName2}.id
        WHERE ${tableName}.username = '${username}'
        ORDER BY ${tableName}.id`
    );
}

const getAllSystemUserDetails = () => {
    let tableName = 'system_users';
    let tableName2 = 'user_types';
    return client.query(
        `SELECT ${tableName}.id, ${tableName}.username, ${tableName}.email, ${tableName2}.type, ${tableName}.is_active FROM ${tableName}  
        LEFT JOIN ${tableName2}
        ON ${tableName}.user_type = ${tableName2}.id

        ORDER BY ${tableName}.id`
    );
}

const insertSystemUser  = ({username, email, encryptedpw, usertypeno}) => {
    let tableName = 'system_users';
    return client.query(
        `INSERT INTO ${tableName} (username, email, encrypted_password, user_type) VALUES ('${username}', '${email}', '${encryptedpw}', ${usertypeno})`
    );
}

const deleteUserFromDB = (uid) => {
    let tableName = 'system_users';

    return client.query(
        `DELETE FROM ${tableName} WHERE id = ${uid}`
    );
}

const makeAdminUserinDB = (uid) => {
    let tableName = 'system_users';

    return client.query(
        `UPDATE ${tableName} SET user_type = 1 WHERE id = ${uid}`
    );
}

const removeAdminUserinDB = (uid) => {
    let tableName = 'system_users';

    return client.query(
        `UPDATE ${tableName} SET user_type = 2 WHERE id = ${uid}`
    );
}

const activateUserinDB = (uid) => {
    let tableName = 'system_users';

    return client.query(
        `UPDATE ${tableName} SET is_active = 'Y' WHERE id = ${uid}`
    );
}

const deactivateUserinDB = (uid) => {
    let tableName = 'system_users';

    return client.query(
        `UPDATE ${tableName} SET is_active = 'N' WHERE id = ${uid}`
    );
}

// MODULES

module.exports = {
    getUsernameAndPassword,
    checkUsernameExists,
    validateUsername,
    changeUserPW,
    getSystemUserDetails,
    getAllSystemUserDetails,
    insertSystemUser,
    deleteUserFromDB,
    makeAdminUserinDB,
    removeAdminUserinDB,
    activateUserinDB,
    deactivateUserinDB,
    initiatePasswordReset,
    getUUID,
    checkUserValidToResetPassword,
    updateEditUserProfile,
}


