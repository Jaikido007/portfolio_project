const chalk = require('chalk');
const webPaymentDbController = require('./webPaymentDatabaseContoller');

const processWeekly = (request, response) => {
    webPaymentDbController.getPaymentFrequencyID('Weekly')
    .then(result => {
        let payFrequency = result.rows[0].id
        webPaymentDbController.getClaimantsReqPayment(payFrequency)
        .then(result => {
            if(result.rowCount === 0) {
                response.render('paymentRunOptions', {'message': 'Nothing to process'})
            } else {


            let dbDate = result.rows[0].current_date
            let myDate = dbDate.getFullYear()+"/"+(dbDate.getMonth()+1)+ "/"+dbDate.getDate();
            
            let i = result.rowCount
            console.log("Row count = " + i)
            for(let j = 0; j <= i-1; j++){

                console.log("Returned date is: " + myDate)
                webPaymentDbController.insertClaimantPensionDetails(
                    myDate,
                    result.rows[j].pt_amount,
                    result.rows[j].pension_type_id,
                    result.rows[j].claimant_id,
                    result.rows[j].bank_name,
                    result.rows[j].account_no,
                    result.rows[j].sort_code,
                    result.rows[j].payment_status
                ) 
                .then(result => {

                })
                .catch(error => {
                    console.log(`${chalk.red ("Error: Couldn't insert payment details " + error)}`)
                }) 
            }
            response.render('paymentRunOptions', {'message': 'Payment run succesful'})
        }
        })
    })
    .catch(error => {
        console.log(`${chalk.red ("Error: getting pension frequency ID" + error)}`)
    }) 
}

const processMonthly = (request, response) => {
    webPaymentDbController.getPaymentFrequencyID('Monthly')
    .then(result => {
        let payFrequency = result.rows[0].id
        webPaymentDbController.getClaimantsReqPayment(payFrequency)
        .then(result => {
            if(result.rowCount === 0) {
                response.render('paymentRunOptions', {'message': 'Nothing to process'})
            } else {


            let dbDate = result.rows[0].current_date
            let myDate = dbDate.getFullYear()+"/"+(dbDate.getMonth()+1)+ "/"+dbDate.getDate();
            
            let i = result.rowCount
            console.log("Row count = " + i)
            for(let j = 0; j <= i-1; j++){

                console.log("Returned date is: " + myDate)
                webPaymentDbController.insertClaimantPensionDetails(
                    myDate,
                    result.rows[j].pt_amount,
                    result.rows[j].pension_type_id,
                    result.rows[j].claimant_id,
                    result.rows[j].bank_name,
                    result.rows[j].account_no,
                    result.rows[j].sort_code,
                    result.rows[j].payment_status
                ) 
                .then(result => {

                })
                .catch(error => {
                    console.log(`${chalk.red ("Error: Couldn't insert payment details " + error)}`)
                }) 
            }
            response.render('paymentRunOptions', {'message': 'Payment run succesful'})
        }
        })
    })
    .catch(error => {
        console.log(`${chalk.red ("Error: getting pension frequency ID" + error)}`)
    }) 
}

module.exports = {
    processWeekly,
    processMonthly,
}