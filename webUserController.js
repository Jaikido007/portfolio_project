const {encryptPassword, checkEncryptedPassword} = require ('./encrypt_password');
const chalk = require('chalk');
const webUserDbController = require('./webDatabseUserController');

let session
const processLoginUser = (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    webUserDbController.checkUsernameExists(username)
    .then(result => {
        if (result.rowCount == 0) {
            response.render ('welcome', {'message':'Invalid username or password'})
            console.log(`${chalk.red ("User doesn't exist in the database ")}`)
        } else {
            webUserDbController.getUsernameAndPassword({username})
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
                            response.render ('welcome', {'message':'Invalid username or password'})
                            console.log(`${chalk.red ("Password doesn't match encrypted password ")}`)
                        }
                    })
                    .catch(error => {
                        response.status(500).send(error);
                        console.log(`${chalk.red ("Error: Issue comparing passwords " + error)}`)
                    }); 
                }
            }) 
                .catch(() => response.status(500).send(`ERROR, couldn't retrieve username and password`));
            } //else ends
        }) // .then ends
        .catch(() => response.status(500).send(`ERROR, user doesn't exist in the database`));
}

const validateUsername2 = (request, response) => {
    let username = request.body.username;
        webUserDbController.validateUsername({username})
        .then(result => {
            if(result.rowCount === 0) {
                response.render('welcome', {'message':'Invalid username or password'})
            } else {
                webUserDbController.initiatePasswordReset(username)
                .then(result => {
                    webUserDbController.getUUID(username)
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
    let username = request.body.username
    webUserDbController.checkUserValidToResetPassword(cui)
    .then(result => {
        if (result.rowCount == 0) {
            response.render('welcome', {'message': 'Unable to reset password'})
        } else {
            if (result.rows[0].password_reset === 'Y'){
                encryptPassword(newPW)
                .then(result => {
                    webUserDbController.changeUserPW(cui, result)
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

const processUserMenu = (request, response) => {
    session = request.session
    session.claimantNino = null
    response.render('usermenu')
}

const processEditProfile = (request, response) => {
    session = request.session
    if(session.username == null){
        response.render('welcome', {'message': 'Session timeout'})
    } else {
        console.log(`${chalk.red ("Error: processEditProfile ")}`)
        let username = session.username
        webUserDbController.getSystemUserDetails(username)
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

const processWelcomeUser = (request, response) => {
    response.render('welcome', {'message': ''})
}

const processUserMaintenance = (request, response) => {
    webUserDbController.getAllSystemUserDetails()
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
        webUserDbController.insertSystemUser({username, email, encryptedpw, usertypeno})
        .then (() => {
            webUserDbController.getSystemUserDetails()
            .then(result => {
                response.render('welcome', {'items':result.rows})
            })
        })
        .catch (error => {
            let message = ('Could not create user')
            response.render('newUser', {message});
            console.log(`${chalk.red ("Error: Process new user - 1st catch " + error)}`)
        })
    })
    .catch(error => {
        let message = ('Could not create user')
        response.render('newUser', {message});
        console.log(`${chalk.red ("Error: Process new user - 2nd catch " + error)}`)
    })
}

const processSystemUsers = (request, response) => {
    webUserDbController.getAllSystemUserDetails()
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
    webUserDbController.deleteUserFromDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processMakeAdmin = (request, response) => {
    let uid = request.body.hiddenMakeAdminId;
    webUserDbController.makeAdminUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processRemoveAdmin = (request, response) => {
    let uid = request.body.hiddenRemoveAdminId;
    webUserDbController.removeAdminUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processActivateUser = (request, response) => {
    let uid = request.body.hiddenActivateUserId;
    webUserDbController.activateUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

const processDeactivateUser = (request, response) => {
    let uid = request.body.hiddenDeactivateUserId;
    webUserDbController.deactivateUserinDB(uid)
    .then(() => processSystemUsers(request, response))
    .catch(() => response.status(500).send('error'));
}

module.exports = {
    processLoginUser,
    processUserMenu,
    processWelcomeUser,
    validateUsername,
    validateUsername2,
    processChangePW,
    processEditProfile,
    processUpdateEditProfile,
    processUserMaintenance,
    processNewUser,
    processSystemUsers,
    processDeleteUser,
    processMakeAdmin,
    processRemoveAdmin,
    processActivateUser,
    processDeactivateUser,
}