const chalk = require('chalk');
const client = require('./db');
const { v4: uuidv4 } = require('uuid');
const { table } = require('console');

// const checkUsernameExists = (username) => {
//     let tableName = 'system_users';
//     let columnName = 'username'
//     return client.query(
//         `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = '${username}'`,
//         );
// }

// const getUsernameAndPassword = ({username}) => {
//     let tableName = 'system_users';
//     return client.query(
//         `SELECT encrypted_password, is_active FROM ${tableName} WHERE username = '${username}'`,
//     );
// }



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
    let tableName3 = 'security_questions'

    return client.query(
        `SELECT *, to_char(a.dob, 'DD/MM/YYYY') AS formatted_date FROM ( 
            SELECT CASE WHEN LENGTH (CAST (dob AS varchar)) <8 
            THEN to_date (CONCAT ('0', CAST(dob AS varchar)),'DDMMYYYY')
            ELSE to_date (CAST(dob AS varchar),'DDMMYYYY')
            END
        AS dob, cl.id, cl.nino, cl.title, cl.first_name, cl.last_name, 
        cl.address1, cl.address2, cl.address3, cl.town, cl.county, cl.postcode,  sc.question AS sec_question1, sc2.question AS sec_question2, CONCAT(ap.app_title, ' ', ap.app_first_name, ' ', ap.app_last_name) AS appointee, cl.sec_answer1, cl.sec_answer2, sc.id AS sec1id, sc2.id AS sec2id
        FROM ${tableName} AS cl 
        LEFT JOIN ${tableName2} AS ap   
        ON cl.appointee2 = ap.id
        LEFT JOIN ${tableName3} AS sc
		ON cl.sec_question1 = sc.id
		LEFT JOIN ${tableName3} AS sc2
		ON cl.sec_question2 = sc2.id
        WHERE cl.nino = '${nino}') a`
    );
}

const getAppointeeUserDetails = (nino) => {
    let tableName = 'claimants';
    let tableName2 = 'appointee';

    return client.query(
        `SELECT *, to_char(a.app_dob2, 'DD/MM/YYYY') AS formatted_date FROM ( 
            SELECT CASE WHEN LENGTH (CAST (app_dob AS varchar)) <8 
            THEN to_date (CONCAT ('0', CAST(app_dob AS varchar)),'DDMMYYYY')
            ELSE to_date (CAST(app_dob AS varchar),'DDMMYYYY')
            END
            AS app_dob2, * FROM ${tableName2} as ap
            LEFT JOIN ${tableName} as cl
            ON ap.id = cl.appointee2
            WHERE cl.nino = 'JW010203A')
            a`
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
    let tableName7 = 'claimants';
    let tableName = 'pension_history';
    let tableName8 = 'payment_outcome';
    return client.query(
        `SELECT ph.pension_date, ph.amount_paid, ph.bank_paid, ph.account_paid, ph.sort_code_paid, po.payment_status, to_char(pension_date, 'DD/MM/YY') AS formatted_date FROM ${tableName} AS ph 
        LEFT JOIN ${tableName7} AS cl
        ON ph.claimant_id = cl.id
        LEFT JOIN ${tableName8} AS po
        ON ph.payment_status = po.id
        WHERE cl.nino = '${nino}'`
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
        `SELECT id, nino FROM ${tableName}  
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
    console.log(abc)
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
            postcode = '${abc.postcode}',
            sec_question1 = ${abc.secQ1},
            sec_question2 = ${abc.secQ2},
            sec_answer1 = '${abc.secA1}',
            sec_answer2 = '${abc.secA2}' 
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
    let tableName = 'payment_bank_details'
    return client.query(
        `UPDATE ${tableName} SET 
            bank_name = '${abc.bank_name}', 
            account_no = '${abc.account_no}', 
            sort_code = ${abc.sort_code} 
            WHERE customer_id = ${clid}`
    );
}

const updatePensionDetailsInDB = (clid, abc) => {
    let tableName = 'claimant_pension_details'
    return client.query(
        `UPDATE ${tableName} SET 
        pension_type_id = ${abc.pensiontype}, 
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

const getAllSecurityQuestions = () => {
    let table = 'security_questions'
    return client.query(
        `SELECT id, question FROM ${table}
        WHERE is_active = 'Y'`
    )
}

const getBenefitOverviewDetails = () => {
    let tableName = 'pension_types'
    let tableName2 = 'claimant_pension_details'
    let tableName3 = 'pension_history'
    return client.query(
        `SELECT b.count, b.formatted_date, b.pension_type, pension_type_id, sum(amount_paid)
        FROM ${tableName3} AS ph
            INNER JOIN (
        SELECT pt.id, pt.pension_type, 
        COUNT(cpd.claimant_id), to_char(a.maxDate, 'DD/MM/YY') 
        AS formatted_date 
        FROM ${tableName} AS pt
        LEFT JOIN ${tableName2} AS cpd
        ON pt.id = cpd.pension_type_id
        INNER JOIN (
            SELECT pension_type_id, MAX(pension_date) AS maxDate 
            FROM ${tableName3} AS ph
            GROUP BY pension_type_id
            ) AS a
        ON pt.id = a.pension_type_id
        WHERE pt.is_active = 'Y'
        GROUP BY pt.id, pt.pension_type, a.maxDate
                ) AS b
            ON ph.pension_type_id = b.id
            GROUP BY b.count, b.formatted_date, b.pension_type, pension_type_id`
    )
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

const getClaimantsReqPayment = (payFrequency => {
    let tableName = 'claimant_pension_details'
    let tableName2 = 'pension_types'
    let tableName3 = 'pension_frequency_details'
    let tableName4 = 'payment_bank_details'
    return client.query(
        `SELECT NOW()::DATE AS current_date, pt.pt_amount, 
        pt.id AS pension_type_id, cpd.claimant_id, pbd.bank_name, pbd.account_no, 
        pbd.sort_code, 1 AS payment_status FROM ${tableName} AS cpd
        LEFT JOIN ${tableName2} AS pt
        ON cpd.pension_type_id = pt.id
        LEFT JOIN ${tableName3} AS pfd
        ON cpd.pension_frequency = pfd.id
        LEFT JOIN ${tableName4} AS pbd
        ON cpd.claimant_id = pbd.customer_id
        WHERE pt.is_active = 'Y' AND pfd.is_active = 'Y' AND pfd.id = ${payFrequency}
        `
    )
})

const getPaymentFrequencyID = (payString => {
    let tableName = 'pension_frequency_details'
    return client.query(
        `SELECT id FROM ${tableName} WHERE frequency = '${payString}'`
    )
})

const insertClaimantPensionDetails = (proDate, amount, penType, claimantID, bankName, accountNo, sortCode, paymentStatus) => {
    let tableName = 'pension_history'
    return client.query(
        `INSERT INTO ${tableName} (
            pension_date, amount_paid, pension_type_id, claimant_id, bank_paid, account_paid, sort_code_paid, payment_status) VALUES ('${proDate}'::date, ${amount}, ${penType}, ${claimantID}, '${bankName}', '${accountNo}', ${sortCode}, ${paymentStatus})`
    )
}


// MODULES

module.exports = {
    // getUsernameAndPassword,
    // checkUsernameExists,
    changeUserPW,
    getSystemUserDetails,
    getAllSystemUserDetails,
    getClaimantUserDetails,
    getAppointeeUserDetails,
    getBankUserDetails,
    getPensionUserDetails,
    getPaymentUserHistory,
    insertSystemUser,
    verifyNino,
    verifySecurityDetails,
    deleteUserFromDB,
    makeAdminUserinDB,
    removeAdminUserinDB,
    activateUserinDB,
    deactivateUserinDB,
    getSecurityQuestions,
    getAllSecurityQuestions,
    updateClaimantInDB,
    updateAppointeeInDB,
    updateBankDetailsInDB,
    updatePensionDetailsInDB,
    getPensionTypes,
    getPensionFrequency,
    getBenefitOverviewDetails,
    initiatePasswordReset,
    getUUID,
    checkUserValidToResetPassword,
    getClaimantsReqPayment,
    getPaymentFrequencyID,
    insertClaimantPensionDetails,
}
