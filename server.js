// import modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mail = require('./mail-setup/mail.js');
const constants = require('./mail-setup/constants.js')

// counters to set limit of email sent.
const EMAIL_SENT_LIMIT = 100;
const EMAIL_SENT_WARNING = 90;
let totalEmailSent = 0;

// set up app and middleware 
const App = express();
App.use(bodyParser.json()); // support json encoded bodies
App.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

//set port
App.set('port', process.env.PORT || 8000);

//set up cors
const corsOptions = {
    origin: constants.heroku,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// get email auth from user and start server
let auth = {user : '', pass : ''};
let transporter;
mail.getEmailAuth().then((result) => {
    
    // save user gmail data and get transporter
    auth.user = result.user;
    auth.pass = result.pass;
    transporter = mail.getTransporter(auth);

    // start server
    const WebServer = App.listen(App.get('port'), () => {
        let Host = WebServer.address().address;
        let Port = WebServer.address().port;
        console.log("Your express web server is listening at http://%s:%s.", Host, Port);
    });
}).catch(console.error);


//start serving static files
App.use(express.static('public'));
App.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

//Accept contact request
App.post('/contactform', cors(corsOptions), (req, res) => {

    // if invalid data supplied return error message.
    if (!req.body.name || !req.body.email || !req.body.subject || !req.body.message) {
        console.log(req.body);
        res.status(200).send("Could not send mail!");
    } else {

        if (totalEmailSent < EMAIL_SENT_LIMIT) {

            // extract data
            const to = auth.user;
            const fromEmail = req.body.email;
            const fromName = req.body.name;
            const subject = req.body.subject;
            const html = req.body.message;

            // send notification for message update
            mail.sendEmail(transporter, {fromName, fromEmail, to, subject, html})
                .then(console.log)
                .catch(console.log);

            // increase total email sent counter
            totalEmailSent += 1;
            
            // check if total email sent is about to reach limit.
            if (totalEmailSent === EMAIL_SENT_WARNING) {

                const to = auth.user;
                // send warning mail
                mail.sendMailWarningLimit(transporter, { totalEmailSent, to })
                    .then(console.log)
                    .catch(console.error);
            }

            // send success message
            res.status(200).send('OK');
            

        } else {

            const to = auth.user;
            //send exceed limit warning
            mail.sendMailExceedLimit(transporter, { totalEmailSent, to })
                .then(console.log)
                .catch(console.error);

            // send success message
            res.status(200).send('Server Busy! Please try again later.');
        }

    }
});

App.get('/80857a7cde4f019aa3a2a755ad989cbc82c1c696cc6e105862e11d8bad8cb2be', cors(corsOptions), (req, res) => {
    totalEmailSent = 0;
    res.status(200).send('<h1>Thank you for resetting contact form limit.</h1>');
});