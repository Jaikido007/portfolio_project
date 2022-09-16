const chalk = require('chalk');
const client = require('./db');

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

const changeUserPW = (username, password) => {
    let tableName = 'system_user';
    let query= `UPDATE "${tableName}" SET (password) = ('${password}') WHERE username = '${username}'`
    console.log(query)
    return client.query(
        `UPDATE "${tableName}" SET password = '${password}' WHERE username = '${username}'`
    );
}

const getSystemUserDetails = (username) => {
    let tableName = 'system_users';
    let tableName2 = 'user_types';
    return client.query(
        `SELECT ${tableName}.id, ${tableName}.username, ${tableName}.email, ${tableName2}.type, ${tableName}.is_active FROM ${tableName}  
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

const getClaimantUserDetails = (nino) => {
    let tableName = 'claimants';
    let tableName2 = 'appointee';

    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName2}
        ON ${tableName}.appointee2 = ${tableName2}.id
        WHERE ${tableName}.nino = '${nino}'`,
    );
}

const getAppointeeUserDetails = (nino) => {
    let tableName = 'claimants';
    let tableName2 = 'appointee';

    return client.query(
        `SELECT * FROM ${tableName2}
        LEFT JOIN ${tableName}
        ON ${tableName2}.id = ${tableName}.appointee2
        WHERE ${tableName}.nino = '${nino}'`
    );
}

const getBankUserDetails = (nino) => {
    let tableName = 'claimants';
    let tableName3 = 'payment_bank_details';

    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName3}
        ON ${tableName}.id = ${tableName3}.customer_id
        WHERE ${tableName}.nino = '${nino}'`,
    );
}

const getPensionUserDetails = (nino) => {
    let tableName = 'claimants';
    let tableName2 = 'claimant_pension_details';
    let tableName5 = 'pension_frequency_details';
    let tableName6 = 'pension_types';

    let bollocks =         `SELECT pfd.frequency, pt.pension_type, pt.id AS pentypeid, pfd.id AS penfreqid, pt.pt_amount FROM ${tableName} AS cl 
    LEFT JOIN ${tableName5} AS pfd
    ON cl.id = pfd.id
    LEFT JOIN ${tableName6} AS pt
    ON cl.id = pt.id
    WHERE cl.nino = '${nino}'`
    console.log(bollocks)

    return client.query(
        `SELECT cpd.pension_amount, cpd.pension_frequency AS penfreqid,  cpd.pension_type_id AS pentypeid, pt.pension_type, pfd.frequency FROM ${tableName} AS cl 
        LEFT JOIN ${tableName2} AS cpd
        ON cl.id = cpd.claimant_id
        LEFT JOIN ${tableName5} AS pfd
        ON cpd.pension_frequency = pfd.id
        LEFT JOIN ${tableName6} AS pt
        ON cpd.pension_type_id = pt.id
        WHERE cl.nino = '${nino}'`
    );
}

const getPaymentUserHistory = (nino) => {
    let tableName = 'claimants';
    let tableName7 = 'pension_history';
    let tableName8 = 'payment_outcome';

    return client.query(
        `SELECT * FROM ${tableName}  
        LEFT JOIN ${tableName7}
        ON ${tableName}.id = ${tableName7}.id
        LEFT JOIN ${tableName8}
        ON ${tableName}.id = ${tableName8}.id
        WHERE ${tableName}.nino = '${nino}'`,
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

const verifySecurityDetails = (nino) => {
    let tableName = 'claimants';

    return client.query(
        `SELECT dob, sec_answer1, sec_answer2 FROM ${tableName}  
        WHERE ${tableName}.nino = '${nino}'`,
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

const getSecurityQuestions = (nino) => {
    let tableName = 'claimants';
    let tableName2 = 'security_questions';

    return client.query(
        `SELECT sec1.question AS sc1, sec2.question AS sc2 FROM ${tableName}
        INNER JOIN ${tableName2} AS sec1
        ON claimants.sec_question1 = sec1.id
        INNER JOIN ${tableName2} AS sec2
        ON ${tableName}.sec_question2 = sec2.id
        WHERE ${tableName}.nino = '${nino}'`
    )
}

const updateClaimantInDB = (nino, abc) => {
    let tableName = 'claimants';
    return client.query(
        `UPDATE ${tableName} SET 
            title = '${abc.title}', 
            first_name = '${abc.first_name}', 
            last_name = '${abc.last_name}', 
            address1 = '${abc.address1}', 
            address2 = '${abc.address2}', 
            address3 = '${abc.address3}', 
            town = '${abc.town}', 
            county = '${abc.county}', 
            postcode = '${abc.postcode}'
            WHERE nino = '${nino}'`
    );
}

const updateAppointeeInDB = (nino, abc) => {
    let tableName = 'appointee';
    return client.query(
        `UPDATE ${tableName} SET 
            title = '${abc.app_title}', 
            first_name = '${abc.app_first_name}', 
            last_name = '${abc.app_last_name}', 
            address1 = '${abc.app_address1}', 
            address2 = '${abc.app_address2}', 
            address3 = '${abc.app_address3}', 
            town = '${abc.app_town}', 
            county = '${abc.app_county}', 
            postcode = '${abc.app_postcode}'
            WHERE nino = '${nino}'`
    );
}

const updateBankDetailsInDB = (clid, abc) => {
    let tableName3 = 'payment_bank_details'
    let query =         `UPDATE ${tableName3} SET 
    bank_name = '${abc.bank_name}', 
    account_no = '${abc.account_no}', 
    sort_code = ${abc.sort_code}, 
    WHERE customer_id = ${clid}`
    console.log(query)
    return client.query(
        `UPDATE ${tableName3} SET 
            bank_name = '${abc.bank_name}', 
            account_no = '${abc.account_no}', 
            sort_code = ${abc.sort_code} 
            WHERE customer_id = ${clid}`
    );
}

const updatePensionDetailsInDB = (clid, abc) => {
    let tableName3 = 'claimant_pension_details'
    let bollocks = `UPDATE ${tableName3} SET 
    pension_type_id = ${abc.sort}, 
    pension_amount = ${abc.pension_amount}, 
    pension_frequency = ${abc.frequency}
    WHERE claimant_id = '${clid}'`
    console.log(bollocks)
    return client.query(
        `UPDATE ${tableName3} SET 
        pension_type_id = ${abc.sort}, 
        pension_amount = ${abc.pension_amount}, 
        pension_frequency = ${abc.frequency}
        WHERE claimant_id = '${clid}'`
    );
}

const getPensionTypes = () => {
    let tableName = 'pension_types'
    return client.query(
        `SELECT id, pension_type FROM ${tableName}
        WHERE is_active = 'Y'`
    )

}

const getPensionFrequency = () => {
    let tableName = 'pension_frequency_details'
    return client.query(
        `SELECT id, frequency FROM ${tableName}
        WHERE is_active = 'Y'`
    )

}

// MODULES

module.exports = {
    getUsernameAndPassword,
    validateUsername,
    changeUserPW,
    getSystemUserDetails,
    getAllSystemUserDetails,
    getClaimantUserDetails,
    getAppointeeUserDetails,
    getBankUserDetails,
    getPensionUserDetails,
    getPaymentUserHistory,
    checkUsernameExists,
    insertSystemUser,
    verifyNino,
    verifySecurityDetails,
    deleteUserFromDB,
    makeAdminUserinDB,
    removeAdminUserinDB,
    activateUserinDB,
    deactivateUserinDB,
    getSecurityQuestions,
    updateClaimantInDB,
    updateAppointeeInDB,
    updateBankDetailsInDB,
    updatePensionDetailsInDB,
    getPensionTypes,
    getPensionFrequency,

}
