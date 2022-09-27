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


module.exports = {
    processLoginUser,
    validateUsername,
    validateUsername2,
}