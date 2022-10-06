const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const {v4: uuidv4} = require('uuid');
const chalk = require('chalk');
const PORT = process.env.PORT;
const sessions = require('express-session');

const webController = require('./webcontroller');
const webUserController = require('./webUserController');
const webPaymentController = require('./webPaymentController');

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

app.get('/usermenu', webUserController.processUserMenu);

app.get('/searchClaimant', (request, response) => {
    response.render('searchClaimant');
});

app.get('/changeProfile', (request, response) => {
    response.render('changeProfile');
});

app.get('/claimantDetails', webController.processClaimantDetails);
app.get('/addClaimantDetails', webController.processAddEditClaimant);

app.get('/appointeeDetails', webController.processAppointeeDetails);
app.get('/addAppointeeDetails', webController.processAddEditAppointee);

app.get('/bankDetails', webController.processBankDetails);
app.get('/addBankDetails', webController.processAddEditBankDetails);

app.get('/pensionDetails', webController.processPensionDetails);
app.get('/addPensionDetails', webController.processAddEditPensionDetails);

app.get('/paymentHistory', webController.processPaymentHistory);

app.get('/userMaintenance', webUserController.processSystemUsers);

app.get('/updateEditProfile', webUserController.processUpdateEditProfile);

app.get('/pwmenu', (request, response) => {
    response.render('pwmenu');
});

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

app.post('/login', webUserController.processLoginUser);
app.post('/welcome',  webUserController.processWelcomeUser);

app.post('/searchClaimant', webController.processSearchClaimant);
app.post('/processSearchClaimant', webController.processSearchClaimant);
app.post('/securityLogin', webController.processSecurityClearence);
app.post('/claimantDetails', webController.processClaimantDetails);

app.post('/benefitOverview', webController.processBenefitOverview);

app.post('/editProfile', webUserController.processEditProfile);

app.post('/userMaintenance', webUserController.processUserMaintenance);
app.post('/newUser', webUserController.processNewUser);

app.post('/validateUsername',  webUserController.validateUsername);
app.post('/validateusername2', webUserController.validateUsername2);
app.post('/changepw', webUserController.processChangePW); 

app.post('/deleteUser', webUserController.processDeleteUser);
app.post('/makeAdmin', webUserController.processMakeAdmin);
app.post('/removeAdmin', webUserController.processRemoveAdmin);
app.post('/activateUser', webUserController.processActivateUser);
app.post('/deactivateUser', webUserController.processDeactivateUser);
app.post('/addClaimant', webController.processAddClaimant);
app.post('/updateClaimant', webController.processUpdateClaimant);
app.post('/addAppointee', webController.processAddAppointee);
app.post('/updateAppointee', webController.processUpdateAppointee);
app.post('/addBankDetails', webController.processAddBankDetails);
app.post('/updateBankDetails', webController.processUpdateBankDetails);
app.post('/addPensionDetails', webController.processAddPensionDetails);
app.post('/updatePensionDetails', webController.processUpdatePensionDetails);

app.post('/processWeekly', webPaymentController.processWeekly);
app.post('/processMonthly', webPaymentController.processMonthly);

app.post('/paymentRunOptions', (request, response) => {
    response.render('paymentRunOptions', {'message': ''})
});

// ! APP.LISTEN SECTION

app.listen(8000, function() {
    console.log(`Running on ${chalk.blue("port:")} ${chalk.yellow(PORT)}`);
})