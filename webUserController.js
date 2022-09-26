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


module.exports = {
    processLoginUser
}