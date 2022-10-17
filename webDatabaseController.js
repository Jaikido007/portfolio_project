const chalk = require('chalk');
const client = require('./db');

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
            WHERE cl.nino = '${nino}')
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
            app_title = '${abc.title}', 
            app_first_name = '${abc.first_name}', 
            app_last_name = '${abc.last_name}', 
            app_address1 = '${abc.address1}', 
            app_address2 = '${abc.address2}', 
            app_address3 = '${abc.address3}', 
            app_town = '${abc.town}', 
            app_county = '${abc.county}', 
            app_postcode = '${abc.postcode}'
            WHERE app_nino = '${nino}'`
    );
}

const getAppointeeID = (app_nino) => {
    let tableName = 'appointee';
    return client.query(
        `SELECT id from ${tableName}
            WHERE app_nino = '${app_nino}'`
    );
}

const getClaimantIDForSession = (nino) => {
    let tableName = 'claimants';
    return client.query(
        `SELECT id from ${tableName}
            WHERE nino = '${nino}'`
    );
}



const updateClaimantWithAppointeeDetails = (session_claimant_id, app_id) => {
    let tableName = 'claimants';
    return client.query(
        `UPDATE ${tableName} SET 
         appointee = 'Y', 
         appointee2 = ${app_id}
         WHERE id = ${session_claimant_id}`
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

const insertClaimantDetailsintoDB = (claimantObject) => {
    let tableName = 'claimants'
    return client.query(
        `INSERT INTO ${tableName}
        (nino, title, first_name, last_name, dob, address1, address2, address3, 
         town, county, postcode, sec_question1, sec_question2,
        sec_answer1, sec_answer2)
        VALUES
        ('${claimantObject.nino}', '${claimantObject.title}', '${claimantObject.first_name}', 
         '${claimantObject.last_name}', '${claimantObject.dob}', '${claimantObject.address1}',
         '${claimantObject.address2}', '${claimantObject.address3}', '${claimantObject.town}',
         '${claimantObject.county}', '${claimantObject.postcode}', ${claimantObject.secQ1},
         ${claimantObject.secQ2}, '${claimantObject.secA1}', '${claimantObject.secA2}')`
    )
}

const insertAppointeeDetailsintoDB = (claimantObject) => {
    let tableName = 'appointee'
    return client.query(
        `INSERT INTO ${tableName}
        (app_nino, app_title, app_first_name, app_last_name, app_dob, app_address1, 
         app_address2, app_address3, app_town, app_county, app_postcode, relationship
        )
        VALUES
        ('${claimantObject.app_nino}', '${claimantObject.title}', '${claimantObject.first_name}', 
         '${claimantObject.last_name}', '${claimantObject.app_dob}', '${claimantObject.address1}',
         '${claimantObject.address2}', '${claimantObject.address3}', '${claimantObject.town}',
         '${claimantObject.county}', '${claimantObject.postcode}', '${claimantObject.relationship}')`
    )
}

const insertBankDetailsintoDB = (claimantObject, customer_id) => {
    let tableName = 'payment_bank_details'
    let query = `INSERT INTO ${tableName}
        (bank_name, account_no, sort_code, customer_id
        )
        VALUES
        ('${claimantObject.bank_name}', '${claimantObject.account_no}',
         '${claimantObject.sort_code}', ${customer_id} )`
    console.log(query)
    return client.query(
        `INSERT INTO ${tableName}
        (bank_name, account_no, sort_code, customer_id
        )
        VALUES
        ('${claimantObject.bank_name}', '${claimantObject.account_no}',
         '${claimantObject.sort_code}', ${customer_id} )`
    )
}

const insertPensionDetailsintoDB = (claimantObject, customer_id) => {
    let tableName = 'claimant_pension_details'
    return client.query(
        `INSERT INTO ${tableName}
        (claimant_id, pension_amount, pension_frequency, pension_type_id
        )
        VALUES
        (${customer_id}, ${claimantObject.pension_amount},${claimantObject.frequency},
         ${claimantObject.pensiontype})`
    )
}

// MODULES

module.exports = {
    getClaimantUserDetails,
    getAppointeeUserDetails,
    getBankUserDetails,
    getPensionUserDetails,
    getPaymentUserHistory,
    verifyNino,
    verifySecurityDetails,
    getSecurityQuestions,
    getAllSecurityQuestions,
    updateClaimantInDB,
    updateAppointeeInDB,
    updateBankDetailsInDB,
    updatePensionDetailsInDB,
    getPensionTypes,
    getPensionFrequency,
    getBenefitOverviewDetails,
    insertClaimantDetailsintoDB,
    insertAppointeeDetailsintoDB,
    insertBankDetailsintoDB,
    insertPensionDetailsintoDB,
    getAppointeeID,
    updateClaimantWithAppointeeDetails,
    getClaimantIDForSession,
}
