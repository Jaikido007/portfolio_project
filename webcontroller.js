//const {encryptPassword, checkEncryptedPassword} = require ('./encrypt_password');
const chalk = require('chalk');
const webDbController = require('./webDatabaseController');
const benefitClaimant = require('./benefit') 
const claimantAppointee = require('./person')

let searchedBenefitClaimant = new benefitClaimant
let claimantsAppointee = new claimantAppointee

const processSearchClaimant = (request, response) => {
    let enteredNino = request.body.nino;
    let newString = tidyString(enteredNino);
    session = request.session
    webDbController.verifyNino(newString)
    .then(result => {
        if(result.rowCount == 0) {
            let message = ('Could not verify National Insurance Number.')
            response.render('searchClaimant', {message});
        } else {
            if(result.rows[0].nino === newString) {
                session.claimantNino = newString
                console.log('Setting session ID to: ' + result.rows[0].id)
                session.claimantID = result.rows[0].id
                webDbController.getSecurityQuestions(result.rows[0].nino)
                .then (result => {
                    response.render('securityLogin', {items:result.rows[0]})
                })
                .catch(error => {
                    console.log(`${chalk.red ("Error: processSearchClaimant 1st catch " + error)}`)
                })  
            } else {
                let message = ('National Insurance Number entered does not match!')
                response.render('searchClaimant', {message});
            }
        }
    })
    .catch(error => {
        console.log(`${chalk.red ("Error: processSearchClaimant 2nd catch " + error)}`)
    })  
}

const tidyString = (nino => {
    let alteredString;
    alteredString = nino.replace(/\s/g, "")
    alteredString = alteredString.replace(/\-/g, "")
    alteredString = alteredString.toUpperCase();
    return alteredString;
})

const processBenefitOverview = (request, response) => {
    webDbController.getBenefitOverviewDetails()
    .then(result => {
        response.render('benefitOverview', {'items': result.rows})
    }) 
    .catch(error => {
        console.log(`${chalk.red ("Error: processBenefitOverview " + error)}`)
})
}

const processSecurityClearence = (request, response) => {
    let dobNum = verifyDOB(request.body['dob-day'], request.body['dob-month'], request.body['dob-year'])
    session = request.session
    console.log('Process security clearance: clid = ' + session.claimantID)
    let nino = session.claimantNino
    webDbController.verifySecurityDetails(nino)
    .then (result => {
        if (dobNum != result.rows[0].dob || request.body.sec1 != result.rows[0].sec_answer1 || request.body.sec2 != result.rows[0].sec_answer2) {
            console.log(`${chalk.red ("Error: Security clearence failed!")}`)
            let message = ('Failed security checks, please try again')
            response.render('searchClaimant', {message});

        } else {
            processClaimantDetails(request, response);
        }
    })
}

const verifyDOB = (day, month, year) => {
    let dob = day+month+year
    let dobNum = parseInt(dob)
    return dobNum;
}

const processClaimantDetails = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
    webDbController.getClaimantUserDetails(nino)
    .then(result => {
        // RESEARCH LATER
        session.claimantID = result.rows[0].id
        populateClaimantInClass(result);
        response.render('claimantDetails', {'items':searchedBenefitClaimant})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processClaimantDetails " + error)}`)
})  
}

const populateClaimantInClass = (dbDetails) => {
    searchedBenefitClaimant.setNino = dbDetails.rows[0].nino;
    searchedBenefitClaimant.setTitle = dbDetails.rows[0].title;
    searchedBenefitClaimant.setFirstName = dbDetails.rows[0].first_name;
    searchedBenefitClaimant.setLastName = dbDetails.rows[0].last_name;
    searchedBenefitClaimant.setDOB = dbDetails.rows[0].formatted_date;
    searchedBenefitClaimant.setAddress1 = dbDetails.rows[0].address1;
    searchedBenefitClaimant.setAddress2 = dbDetails.rows[0].address2;
    searchedBenefitClaimant.setAddress3 = dbDetails.rows[0].address3;
    searchedBenefitClaimant.setTown = dbDetails.rows[0].town;
    searchedBenefitClaimant.setCounty = dbDetails.rows[0].county;
    searchedBenefitClaimant.setPostcode = dbDetails.rows[0].postcode;
    searchedBenefitClaimant.setAppointee = dbDetails.rows[0].appointee;
    searchedBenefitClaimant.setSecurityQuestion1 = dbDetails.rows[0].sec_question1;
    searchedBenefitClaimant.setSecurityQuestion2 = dbDetails.rows[0].sec_question2;
    searchedBenefitClaimant.setSecurityAnswer1 = dbDetails.rows[0].sec_answer1;
    searchedBenefitClaimant.setSecurityAnswer2 = dbDetails.rows[0].sec_answer2;
}

const processAppointeeDetails = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
        webDbController.getAppointeeUserDetails(nino)
        .then(result => {
            populateAppointeeDetailsInClass(result)
            response.render('appointeeDetails', {'items':claimantsAppointee})
        }
        )
    .catch(error => {
        console.log(`${chalk.red ("Error: processAppointeeDetails " + error)}`)
    })  
}

const populateAppointeeDetailsInClass = (dbDetails) => {
    claimantsAppointee.setNino = dbDetails.rows[0].app_nino;
    claimantsAppointee.setTitle = dbDetails.rows[0].app_title;
    claimantsAppointee.setFirstName = dbDetails.rows[0].app_first_name;
    claimantsAppointee.setLastName = dbDetails.rows[0].app_last_name;
    claimantsAppointee.setDOB = dbDetails.rows[0].formatted_date;
    claimantsAppointee.setAddress1 = dbDetails.rows[0].app_address1;
    claimantsAppointee.setAddress2 = dbDetails.rows[0].app_address2;
    claimantsAppointee.setAddress3 = dbDetails.rows[0].app_address3;
    claimantsAppointee.setTown = dbDetails.rows[0].app_town;
    claimantsAppointee.setCounty = dbDetails.rows[0].app_county;
    claimantsAppointee.setPostcode = dbDetails.rows[0].app_postcode;    
}


const processBankDetails = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
    webDbController.getBankUserDetails(nino)
    .then(result => {
        populateBankDetailsInClass(result)
        response.render('bankDetails', {'items':searchedBenefitClaimant})
    }
    )
.catch(error => {
    console.log(`${chalk.red}Error: processBankDetails ` + error)
})  
}

const populateBankDetailsInClass = (dbDetails) => {
    searchedBenefitClaimant.setBankName = dbDetails.rows[0].bank_name;
    searchedBenefitClaimant.setBankAccountNumber = dbDetails.rows[0].account_no;
    searchedBenefitClaimant.setBankSortCode = dbDetails.rows[0].sort_code;
}

const processPensionDetails = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
    webDbController.getPensionUserDetails(nino)
    .then(result => {
        populatePensionDetailsInClass(result)
        response.render('pensionDetails', {'items':searchedBenefitClaimant})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processBankDetails " + error)}`)
})  
}

const populatePensionDetailsInClass = (dbDetails) => {
    searchedBenefitClaimant.setPensionAmount = dbDetails.rows[0].pension_amount;
    searchedBenefitClaimant.setPensionType = dbDetails.rows[0].pension_type;
    searchedBenefitClaimant.setPensionFrequency = dbDetails.rows[0].frequency;
}

const processPaymentHistory = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
    webDbController.getPaymentUserHistory(nino)
    .then(result => {
        response.render('paymentHistory', {'items':result.rows})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processPaymentHistory " + error)}`)
})  
}

const processAddClaimant = (request, response) => {
    console.log('processAddClaimant')
}

const processUpdateClaimant = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
    // console.log('processUpdateClaimant info:' + request.body)
    webDbController.updateClaimantInDB(nino, request.body)
    .then(result => {
        processClaimantDetails(request, response);
    })
    .catch(error => {
        console.log(`${chalk.red ("Error: processUpdateClaimant " + error)}`)
    }) 
}

const processAddAppointee = (request, response) => {
    console.log('processAddAppointee')
}

const processUpdateAppointee = (request, response) => {
    let session = request.session
    let nino = claimantsAppointee.getNino;
    console.log(request.body);
    let bool_flag = checkforAppointeeUpdates(request.body)
    if(bool_flag === true) {
        console.log('Somet to update')
    webDbController.updateAppointeeInDB(nino, request.body)
    .then(result => {
        processAppointeeDetails(request, response);
    })
    .catch(error => {
        console.log(`${chalk.red ("Error: processUpdateAppointee " + error)}`)
    }) 
} else {
    console.log('Nowt to update')
    processAppointeeDetails(request, response);
}

}

const checkforAppointeeUpdates = (form_data) => {
    if(
    form_data.title != claimantsAppointee.getTitle ||
    form_data.first_name != claimantsAppointee.getFirstName ||
    form_data.last_name != claimantsAppointee.getLastName ||
    form_data.address1 != claimantsAppointee.getAddress1 ||
    form_data.address2 != claimantsAppointee.getAddress2 ||
    form_data.address3 != claimantsAppointee.getAddress3 ||
    form_data.town != claimantsAppointee.getTown ||
    form_data.county != claimantsAppointee.getCounty ||
    form_data.postcode != claimantsAppointee.getPostcode
) {
return true
} else {
return false
}
}

const processAddBankDetails = (request, response) => {
    console.log('processAddBankDetails')

}

const processUpdateBankDetails = (request, response) => {
    console.log('Update bank details session = '+ request.session)
    let session = request.session
    let clid = session.claimantID
    console.log('Update bank details: clid = ' + clid)
    webDbController.updateBankDetailsInDB(clid, request.body)
    .then(result => {
        processBankDetails(request, response);
    })
    .catch(error => {
        console.log(`${chalk.red ("Error: processUpdateBankDetails " + error)}`)
    }) 
}

const processAddPensionDetails = (request, response) => {
    console.log('processAddPensionDetails')

}

const processUpdatePensionDetails = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
    let clid = session.claimantID
    webDbController.updatePensionDetailsInDB(clid, request.body)
    .then(result => {
        processPensionDetails(request, response);
    })
    .catch(error => {
        console.log(`${chalk.red ("Error: processUpdatePensionDetails " + error)}`)
    }) 
}

// * PROCESS ADD EDIT SECTION

const processAddEditClaimant = (request, response) => {
    let session = request.session
    if(session.claimantNino == null) {
        response.render('addClaimantDetails', {items: []})
    } else {
        webDbController.getClaimantUserDetails(session.claimantNino)
        .then(result => {
            let clDetails = result
            webDbController.getAllSecurityQuestions()
            .then(result => {
                response.render('addClaimantDetails', {items: clDetails.rows[0], secQuestions:result.rows})
            })
        })
    }
}

const processAddEditAppointee = (request, response) => {
    let session = request.session
    if(session.claimantNino == null) {
        response.render('addAppointeeDetails', {items: []})
    } else {
        webDbController.getAppointeeUserDetails(session.claimantNino)
        .then(result => {
            response.render('addAppointeeDetails', {items: result.rows[0]})
        })
    }
}

const processAddEditBankDetails = (request, response) => {
    let session = request.session
    if(session.claimantNino == null) {
        response.render('addBankDetails', {items: []})
    } else {
        webDbController.getBankUserDetails(session.claimantNino)
        .then(result => {
            response.render('addBankDetails', {items: result.rows[0]})
        })
    }
}

const processAddEditPensionDetails = (request, response) => {
    let session = request.session
    if(session.claimantNino == null) {
        response.render('addPensionDetails', {items: []})
    } else {
        webDbController. getPensionUserDetails(session.claimantNino)
        .then(result => {
            let penDetails = result
            webDbController.getPensionTypes()
            .then(result => {
                let penTypes = result;
                webDbController.getPensionFrequency()
                .then(result => {
                    response.render('addPensionDetails', {items: penDetails.rows[0], penTypes:penTypes.rows, penFreqs:result.rows})
                })
                .catch(error => {
                    console.log(`${chalk.red ("Error: getPensionFrequency " + error)}`)
                }) 
            })
            .catch(error => {
                console.log(`${chalk.red ("Error: getPensionTypes " + error)}`)
            }) 
        })
        .catch(error => {
            console.log(`${chalk.red ("Error: getPensionUserDetails " + error)}`)
        }) 
    }
}

const processWeekly = (request, response) => {
    webDbController.getPaymentFrequencyID('Weekly')
    .then(result => {
        let payFrequency = result.rows[0].id
        webDbController.getClaimantsReqPayment(payFrequency)
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
                webDbController.insertClaimantPensionDetails(
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
    webDbController.getPaymentFrequencyID('Monthly')
    .then(result => {
        let payFrequency = result.rows[0].id
        webDbController.getClaimantsReqPayment(payFrequency)
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
                webDbController.insertClaimantPensionDetails(
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
    processSearchClaimant,
    processBenefitOverview,
    processSecurityClearence,
    processClaimantDetails,
    processAppointeeDetails,
    processBankDetails,
    processPensionDetails,
    processPaymentHistory,
    processAddClaimant,
    processUpdateClaimant,
    processAddAppointee,
    processUpdateAppointee,
    processAddBankDetails,
    processUpdateBankDetails,
    processAddPensionDetails,
    processUpdatePensionDetails,
    processAddEditClaimant,
    processAddEditAppointee,
    processAddEditBankDetails,
    processAddEditPensionDetails,
    processWeekly,
    processMonthly,
}