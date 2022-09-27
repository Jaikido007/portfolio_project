const chalk = require('chalk');
const client = require('./db');

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

module.exports = {
    getPaymentFrequencyID,
    insertClaimantPensionDetails,
    getClaimantsReqPayment,
}