const {encryptPassword, checkEncryptedPassword} = require ('./encrypt_password');
const chalk = require('chalk');
const webDbController = require('./webDatabaseController');
const res = require('express/lib/response');

const validateUsername2 = (request, response) => {
    let username = request.body.username;
        webDbController.validateUsername({username})
        .then(result => {
            if(result.rowCount === 0) {
                response.render('welcome', {'message':'Invalid username or password'})
            } else {
                webDbController.initiatePasswordReset(username)
                .then(result => {
                    webDbController.getUUID(username)
                    .then(result => {
                        response.render('fakeEmailPage', {'items': result.rows[0]})
                    })
                    .catch(error => {
                        console.log(`${chalk.red ("Error: Can't get UUID from database " + error)}`)
                })
                })
                .catch(error => {
                    console.log(`${chalk.red ("Error: Couldn't update database with reset credentials " + error)}`)
            })
        }
    })
    .catch(error => {
            console.log(`${chalk.red ("Error: Couldn't validate user exists! " + error)}`)
    })
}
    


const validateUsername = (request, response) => {
    response.render('validateUsername')
}

const processChangePW = (request, response) => {
    let cui = request.body.cui
    let newPW = request.body.password2;
    // let username = request.body.username
    webDbController.checkUserValidToResetPassword(cui)
    .then(result => {
        if (result.rowCount == 0) {
            response.render('welcome', {'message': 'Unable to reset password'})
        } else {
            if (result.rows[0].password_reset === 'Y'){
                encryptPassword(newPW)
                .then(result => {
                    webDbController.changeUserPW(cui, result)
                    .then(result => {
                        response.render('welcome', {'message': 'Password successfully updated'})
                    })
                    .catch(error => {
                        console.log(`${chalk.red ("Error: failed to update password change " + error)}`)
                    })  
                })
                .catch(error => {
                    console.log(`${chalk.red ("Error: failed to encrypt password " + error)}`)
                })  
            } else {
                response.render('welcome', {'message': 'Unable to reset password'})
            }
        }
    })
    .catch(error => {
        console.log(`${chalk.red ("Error:  User is not valid to reset password" + error)}`)
    }) 
} 

processUserMenu = (request, response) => {
    session = request.session
    session.claimantNino = null
    response.render('usermenu')
}

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
                let message = ('Entered National Insurance Number does not match!')
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
        console.log(result.rows)
        response.render('benefitOverview', {'items': result.rows})
    }) 
    .catch(error => {
        console.log(`${chalk.red ("Error: processBenefitOverview " + error)}`)
})
}


const processEditProfile = (request, response) => {
    session = request.session
    if(session.username == null){
        response.render('welcome', {'message': 'Session timeout'})
    } else {
        console.log(`${chalk.red ("Error: processEditProfile ")}`)
        let username = session.username
        webDbController.getSystemUserDetails(username)
        .then(result => {
            response.render('editProfile', {'items':result.rows[0]})
        }
        )
    .catch(error => {
        console.log(`${chalk.red ("Error: processEditProfile " + error)}`)
    })  
    }
}

const processUpdateEditProfile = (request, response) => {
    response.render('updateEditProfile')
}

const processSecurityClearence = (request, response) => {
    let dobNum = verifyDOB(request.body['dob-day'], request.body['dob-month'], request.body['dob-year'])
    session = request.session
    console.log('Process security clearance: clid = ' + session.claimantID)
    let nino = session.claimantNino
    webDbController.verifySecurityDetails(nino)
    .then (result => {
        if (dobNum != result.rows[0].dob || request.body.sec1 != result.rows[0].sec_answer1 || request.body.sec2 != result.rows[0].sec_answer2) {
            console.log(`${chalk.red ("Error: You've probably mistyped the password Jay ")}`)
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
        response.render('claimantDetails', {'items':result.rows[0]})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processClaimantDetails " + error)}`)
})  
}

const processWelcomeUser = (request, response) => {
    response.render('welcome', {'message': ''})
}

const processAppointeeDetails = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
        webDbController.getAppointeeUserDetails(nino)
        .then(result => {
            response.render('appointeeDetails', {'items':result.rows[0]})
        }
        )
    .catch(error => {
        console.log(`${chalk.red ("Error: processAppointeeDetails " + error)}`)
    })  
}



const processBankDetails = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
    webDbController.getBankUserDetails(nino)
    .then(result => {
        response.render('bankDetails', {'items':result.rows[0]})
    }
    )
.catch(error => {
    console.log(`${chalk.red}Error: processBankDetails ` + error)
})  
}

const processPensionDetails = (request, response) => {
    let session = request.session
    let nino = session.claimantNino
    webDbController.getPensionUserDetails(nino)
    .then(result => {
        response.render('pensionDetails', {'items':result.rows[0]})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processBankDetails " + error)}`)
})  
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

const processUserMaintenance = (request, response) => {
    webDbController.getAllSystemUserDetails()
    .then(result => {
        response.render('userMaintenance', {'items':result.rows})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processUserMaintenance " + error)}`)
}) 
}

const processNewUser = (request, response) => {
    username = request.body.username
    email = request.body.email
    password = request.body.password
    encryptedpw = ''
    usertypeno = 0
    usertype = request.body.usertype
    switch(usertype) {
        case 'admin':
        usertypeno = 1
        break;
        case 'user':
            usertypeno = 2
        break;
        default:
            usertype = 99
    }
    encryptPassword(password)
    .then (result => {
        encryptedpw = result
        webDbController.insertSystemUser({username, email, encryptedpw, usertypeno})
        .then (() => {
            webDbController.getSystemUserDetails()
            .then(result => {
                response.render('userMaintenance', {'items':result.rows})
            })
        })
        .catch (error => {
            console.log(`${chalk.red} ERROR: processNewUser 1st catch ` + error)
        })
    })
    .catch(error => {
        console.log(`${chalk.red} Error: processNewUser 2nd catch` + error)
    })
}

const processSystemUsers = (request, response) => {
    webDbController.getAllSystemUserDetails()
    .then(result => {
        response.render('userMaintenance', {'items':result.rows})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processUserMaintenance " + error)}`)
}) 
}

// * PROCESS BUTTONS

const processDeleteUser = (request, response) => {
    let uid = request.body.hiddenDelID;
    webDbController.deleteUserFromDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processMakeAdmin = (request, response) => {
    let uid = request.body.hiddenMakeAdminId;
    webDbController.makeAdminUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processRemoveAdmin = (request, response) => {
    let uid = request.body.hiddenRemoveAdminId;
    webDbController.removeAdminUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processActivateUser = (request, response) => {
    let uid = request.body.hiddenActivateUserId;
    webDbController.activateUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processDeactivateUser = (request, response) => {
    let uid = request.body.hiddenDeactivateUserId;
    webDbController.deactivateUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
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
    let nino = session.claimantNino
    webDbController.updateAppointeeInDB(nino, request.body)
    .then(result => {
        processAppointeeDetails(request, response);
    })
    .catch(error => {
        console.log(`${chalk.red ("Error: processUpdateAppointee " + error)}`)
    }) 
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
    processWelcomeUser,
    validateUsername,
    validateUsername2,
    processChangePW,
    processSearchClaimant,
    processBenefitOverview,
    processEditProfile,
    processUpdateEditProfile,
    processSecurityClearence,
    processClaimantDetails,
    processAppointeeDetails,
    processBankDetails,
    processPensionDetails,
    processPaymentHistory,
    processUserMaintenance,
    processNewUser,
    processSystemUsers,
    processDeleteUser,
    processMakeAdmin,
    processRemoveAdmin,
    processActivateUser,
    processDeactivateUser,
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