const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const {v4: uuidv4} = require('uuid');
console.log(uuidv4());
const chalk = require('chalk');
const PORT = process.env.PORT;
const sessions = require('express-session');

const webController = require('./webcontroller')

app.use(express.static(path.join('./public/')));
app.use('assets', express.static(path.join(__dirname, '../assets')));

let PostgreSqlStore = require('connect-pg-simple')(sessions);
let sessionOptions = {
    secret:'BobbleHeadSausageFace', 
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 500000
    },
    store: new PostgreSqlStore({
        conString:'postgres://postgres:Password123@localhost:5432/pscs_mock'
    })
}

app.use(sessions(sessionOptions));

// APP.GET SECTION

app.get('/login', (request, response) => {
    response.render('welcome');
});

app.get('/usermenu', webController.processUserMenu);

app.get('/searchClaimant', (request, response) => {
    response.render('searchClaimant');
});

app.get('/addClaimantDetails', (request, response) => {
    response.render('addClaimantDetails');
});

app.get('/claimantDetails', webController.processClaimantDetails);
app.get('/appointeeDetails', webController.processAppointeeDetails);
app.get('/bankDetails', webController.processBankDetails);
app.get('/pensionDetails', webController.processPensionDetails);
app.get('/paymentHistory', webController.processPaymentHistory);

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
app.post('/processSearchClaimant', webController.processSearchClaimant);
app.post('/securityLogin', webController.processSecurityClearence);
app.post('/claimantDetails', webController.processClaimantDetails);

app.post('/benefitOverview', webController.processBenefitOverview);

app.post('/editProfile', webController.processEditProfile);

app.post('/userMaintenance', webController.processUserMaintenance);
app.post('/newUser', webController.processNewUser);

app.post('/validateUsername',  webController.validateUsername);
app.post('/validateusername2', webController.validateUsername2);
app.post('/changepw', webController.processChangePW); 

app.post('/deleteUser', webController.processDeleteUser);
app.post('/makeAdmin', webController.processMakeAdmin);
app.post('/removeAdmin', webController.processRemoveAdmin);
app.post('/activateUser', webController.processActivateUser);
app.post('/deactivateUser', webController.processDeactivateUser);





// ! APP.LISTEN SECTION

app.listen(8001, function() {
    console.log(`Running on ${chalk.blue("port:")} ${chalk.yellow(PORT)}`);
})