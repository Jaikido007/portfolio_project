const {encryptPassword, checkEncryptedPassword} = require ('./encrypt_password');
const chalk = require('chalk');
const webDbController = require('./webDatabaseController');
const res = require('express/lib/response');

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
                let encryptedpw = result.rows[0].encrypted_password
                checkEncryptedPassword({password, encryptedpw})
                .then((result) => {
                    if (result === true) {
                        // SESSION VARIABLES TO SET UP
                        response.render('usermenu')
                    } else {
                        response.render ('welcome')
                        console.log(`ERROR, password doesn' match encrypted password`);
                    }
                })
                .catch(error => {
                    response.status(500).send(error);
                    console.log(`ERROR, passwords don't match!`)
                }); {

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

const processSearchClaimant = (request, response) => {
    console.log("Search claimant")
    response.render('searchClaimant')
}

const processBenefitOverview = (request, response) => {
    console.log("Benefit overview")
    response.render('benefitOverview')
}

const processEditProfile = (request, response) => {
    // TO FIX - this is harddcoded
    uid = 4
    webDbController.getSystemUserDetails(uid)
    .then(result => {
        response.render('editProfile', {'items':result.rows[0]})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processEditProfile " + error)}`)
})  

}

const processUpdateEditProfile = (request, response) => {
    // field = request.body.field
    console.log(request.body)
    // console.log(field)
    response.render('updateEditProfile')
}

const processSecurityClearence = (request, response) => {
    console.log("Security clearence")
    response.render('securityLogin')
}

const processClaimantDetails = (request, response) => {

    uid = 1
    webDbController.getClaimantUserDetails(uid)
    .then(result => {
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
    response.render('claimantDetails#appointee-details')
}


const processBankDetails = (request, response) => {
    uid = 1
    webDbController.getUserBankDetails(uid)
    .then(result => {
        response.render('claimantDetails#bank-details', {'items':result.rows[0]})
    }
    )
.catch(error => {
    console.log(`${chalk.red ("Error: processBankDetails " + error)}`)
})  
}

const processPensionDetails = (request, response) => {
    response.render('claimantDetails#pension-details')
}

const processPaymentHistory = (request, response) => {
    response.render('claimantDetails#payment-history')
}

const processUserMaintenance = (request, response) => {
    uid = 4
    webDbController.getSystemUserDetails(uid)
    .then(result => {
        response.render('userMaintenance', {'items':result.rows[0]})
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
        .then (() => response.render('userMaintenance'))
        .catch (error => {
            console.log(error)
        })
    })
    .catch(error => {
        console.log(error)
    })

}

module.exports = {
    processLoginUser,
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
}