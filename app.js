const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const {v4: uuidv4} = require('uuid');
console.log(uuidv4());
const chalk = require('chalk');
const PORT = process.env.PORT || 8080;

const webController = require('./webcontroller')

app.use(express.static(path.join('./public/')));
app.use('assets', express.static(path.join(__dirname, '../assets')));


// APP.GET SECTION

app.get('/login', (request, response) => {
    response.render('welcome');
});

app.get('/usermenu', (request, response) => {
    response.render('usermenu');
});

app.get('/searchClaimant', (request, response) => {
    response.render('searchClaimant');
});

app.get('/claimantDetails', (request, response) => {
    response.render('claimantDetails');
});

app.get('/userMaintenance', webController.processSystemUsers);

app.get('/updateEditProfile', webController.processUpdateEditProfile);

app.get('/newUser', (request, response) => {
    response.render('newUser');
});


// APP.SET SECTION

app.set('views', 'views');
app.set('view engine', 'njk');

nunjucks.configure(
    [
        "node_modules/govuk-frontend", 
        "views"
    ],
    {
        autoescape: true,
        express: app,

    },
);

// APP.USE SECTION

app.use(bodyParser.urlencoded(({
    extended:true})));

app.use(bodyParser.json());

// APP.POST SECTION

app.post('/login',  webController.processLoginUser);
app.post('/welcome',  webController.processWelcomeUser);

app.post('/searchClaimant', webController.processSearchClaimant);
app.post('/securityLogin', webController.processSecurityClearence);
app.post('/claimantDetails', webController.processClaimantDetails);
// app.post('/claimantDetails',function(request, response, next){console.log(request); next()}, webController.processAppointeeDetails);
// app.post('/claimantDetails#bank-details', webController.processBankDetails);
// app.post('/claimantDetails#pension-details', webController.processPensionDetails);
// app.post('/claimantDetails#payment-history', webController.processPaymentHistory);

app.post('/benefitOverview', webController.processBenefitOverview);

app.post('/editProfile', webController.processEditProfile);

app.post('/userMaintenance', webController.processUserMaintenance);
app.post('/newUser', webController.processNewUser);

app.post('/validateUsername',  webController.validateUsername);
app.post('/validateusername2', webController.validateUsername2);
app.post('/changepw', webController.processChangePW); 





// ! APP.LISTEN SECTION

app.listen(8001, function() {
    console.log(`Running on ${chalk.blue("port:")} ${chalk.yellow(PORT)}`);
})