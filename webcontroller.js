const {encryptPassword, checkEncryptedPassword} = require ('./encrypt_password');
const chalk = require('chalk');
const webDbController = require('./webDatabaseController');
const res = require('express/lib/response');
let session

const processLoginUser = (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    webDbController.checkUsernameExists(username)
    .then(result => {
        if (result.rowCount == 0) {
            // FIX LATER
            console.log(`ERROR, user doesn't exist in the database`);

        } else {

            webDbController.getUsernameAndPassword({username})
            .then(result => {
                if (result.rows[0].is_active === 'Y') {
                    let encryptedpw = result.rows[0].encrypted_password
                    checkEncryptedPassword({password, encryptedpw})
                    .then((result) => {
                        if (result === true) {
                            session = request.session;
                            session.username = username

                            response.render('usermenu')
                        } else {
                            response.render ('welcome')
                            console.log(`ERROR, password doesn' match encrypted password`);
                        }
                    })
                    .catch(error => {
                        response.status(500).send(error);
                        console.log(`ERROR, passwords don't match!`)
                    }); 
                }
                }) 

                .catch(() => response.status(500).send(`ERROR, couldn't retrieve username and password`));
            }})
            .catch(() => response.status(500).send(`ERROR, user doesn't exist in the database`));
        };

const validateUsername2 = (request, response) => {
    let username = request.body.username;
        webDbController.validateUsername({username})
        .then(result => {
            if(result.rows[0].username === username) {
                response.render('pwmenu', {username: username})
            } else {
                response.render('welcome')
            }
        })
}

const validateUsername = (request, response) => {

    response.render('validateUsername')
}

const processChangePW = (request, response) => {
    let newPW = request.body.password2;
    let username = request.body.username
    console.log(newPW + " " + username)
    webDbController.changeUserPW(username, newPW)
    .then(result => {
            response.render('usermenu', {username: username})
        }
    )
    .catch(error => {
        // response.render('register', {message: dbError})
        console.log(`${chalk.red ("Error: processChangePW")}`)
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
    session.claimantNino = newString
    console.log(newString)
    console.log(enteredNino)
    webDbController.verifyNino(newString)
    .then(result => {
        if(result.rowCount == 0) {
            console.log('No such NINO found!')
            let message = ('Could not verify National Insurance Number.')
            response.render('searchClaimant', {message});
        } else {
            console.log(result)
            if(result.rows[0].nino === newString) {
                webDbController.getSecurityQuestions(result.rows[0].nino)
                .then (result => {
                    response.render('securityLogin', {items:result.rows[0]})
                })
                .catch(error => {
                    console.log(`${chalk.red ("Error: processSearchClaimant " + error)}`)
                })  
            } else {
                let message = ('Entered NINO does not match!')
                response.render('searchClaimant', {message});
            }

        }
    })
    .catch(error => {
        console.log(`${chalk.red ("Error: processSearchClaimant " + error)}`)
    })  
}

const tidyString = (nino => {
    let alteredString;
    alteredString = nino.replace(/\s/g, "")
    alteredString = alteredString.replace(/\-/g, "")
    alteredString = alteredString.toUpperCase();
    console.log(alteredString)

    return alteredString;
})

const processBenefitOverview = (request, response) => {
    console.log("Benefit overview")
    response.render('benefitOverview')
}

const processEditProfile = (request, response) => {
    session = request.session
    if(session.username == null){
        response.render('welcome')
    } else {
        console.log('processEditProfile')
        let username = session.username
        console.log(username)
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
    console.log("Security clearence")
    console.log(request.body)
    let dobNum = verifyDOB(request.body['dob-day'], request.body['dob-month'], request.body['dob-year'])
    session = request.session
    let nino = session.claimantNino
    webDbController.verifySecurityDetails(nino)
    .then (result => {
        console.log(dobNum + '------' + result.rows[0].dob);
        console.log(request.body.sec1 + '--------' + result.rows[0].sec_answer1)
        console.log(request.body.sec2 + '--------' + result.rows[0].sec_answer2)
        if (dobNum != result.rows[0].dob || request.body.sec1 != result.rows[0].sec_answer1 || request.body.sec2 != result.rows[0].sec_answer2) {
            console.log('Its all gone to pot')
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
        console.log(result.rows[0])
        response.render('claimantDetails', {'items':result.rows[0]})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processClaimantDetails " + error)}`)
})  
}

const processWelcomeUser = (request, response) => {
    response.render('welcome')
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
    console.log(`${chalk.red ("Error: processBankDetails " + error)}`)
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
        response.render('paymentHistory', {'items':result.rows[0]})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processPaymentHistory " + error)}`)
})  
}

const processUserMaintenance = (request, response) => {
    webDbController.getAllSystemUserDetails()
    .then(result => {
        console.log(result)
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
    console.log(usertype)
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
        console.log(encryptedpw + ' ' + usertypeno)
        webDbController.insertSystemUser({username, email, encryptedpw, usertypeno})
        .then (() => {
            webDbController.getSystemUserDetails()
            .then(result => {
                response.render('userMaintenance', {'items':result.rows})
            })
        })
        .catch (error => {
            console.log(error)
        })
    })
    .catch(error => {
        console.log(error)
    })
}

const processSystemUsers = (request, response) => {
    console.log('I AM HERE!')
    webDbController.getAllSystemUserDetails()
    .then(result => {
        response.render('userMaintenance', {'items':result.rows})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processUserMaintenance " + error)}`)
}) 
}

const processDeleteUser = (request, response) => {
    let uid = request.body.hiddenDelID;
    console.log(request.body)
    console.log(uid)
    webDbController.deleteUserFromDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processMakeAdmin = (request, response) => {
    let uid = request.body.hiddenMakeAdminId;
    console.log(uid)
    webDbController.makeAdminUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processRemoveAdmin = (request, response) => {
    let uid = request.body.hiddenRemoveAdminId;
    console.log(uid)
    webDbController.removeAdminUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processActivateUser = (request, response) => {
    let uid = request.body.hiddenActivateUserId;
    console.log(uid)
    webDbController.activateUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processDeactivateUser = (request, response) => {
    let uid = request.body.hiddenDeactivateUserId;
    console.log(uid)
    webDbController.deactivateUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}




module.exports = {
    processLoginUser,
    processWelcomeUser,
    validateUsername,
    validateUsername2,
    processChangePW,
    processUserMenu,
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
}