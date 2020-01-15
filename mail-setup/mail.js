const crypt = require('./crypt.js');
const prompts = require('prompts');
const nodemailer = require('nodemailer');
const constants = require('./constants');

/**
 * Get Email and Password from user cmd input
 */
const getEmailAuth = async () => {
    return {
        user: crypt.encrypt(constants.auth.user),
        pass: crypt.encrypt(constants.auth.pass)
    };
};

/**
 * returns transporter for mail
 */
const getTransporter = (auth) => {
    return nodemailer.createTransport({
        host: "jamisolutions.com",
        port : 465,
        auth : {
            user : crypt.decrypt(auth.user),
            pass : crypt.decrypt(auth.pass)
        }
    });
};

/**
 * send email using transport.
 * @param {object} data 
 */
const sendEmail = async (transporter, data) => {

    try {

        // build message
        const html = `<p><b>Sender Name : </b>${data.fromName}</p>`
                     + `<p><b>Sender Email : </b>${data.fromEmail}</p>`
                     + `<p><b>Subject : </b>${data.subject} </p>`
                     + `<p><b>Message : </b></p>`
                     + `<p> ${data.html} </p>`;

        // build mail options
        // to : we are sending to ourselves
        const mailOptions = {
            from: 'info@jamisolutions.com',
            to: crypt.decrypt(data.to),
            subject : 'JS Contact Form Submission',
            html
        };

        // send email using data and transporter provided
        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
        return error;
    }
};

/**
 * function to send reset mail with reset link for Email Service.
 * @param {object} transporter 
 * @param {object} data 
 */
const sendMailExceedLimit = async (transporter, data) => {
    try {

        const resetLink = constants.resetURL;

        // build message
        const html = `<h3>Contact form email sent request is exceed.<h3>`
                     + `<h3>For security reason service has been turned off.</h3>`
                     + `<h3>Click following link to start service again.</h3>`
                     + `<p><a href='${resetLink}'>Reset Server</a></p>`;

        // build mail options
        // to : we are sending to ourselves
        const mailOptions = {
            from: 'info@jamisolutions.com',
            to: crypt.decrypt(data.to),
            subject : 'WARNING : CONTACT FORM LIMIT EXCEEDED',
            html
        };

        // send email using data and transporter provided
        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
        return error;
    }
};

/**
 * function to send warning mail with reset link for email service.
 * @param {object} transporter 
 * @param {object} data 
 */
const sendMailWarningLimit = async (transporter, data) => {
    try {
        const resetLink = constants.resetURL;

        // build message
        const html = `<h3>Contact form email sent request is about to exceed.<h3>`
                     + `<h3>For security reason service will be turned off, when it will exceed limit.</h3>`
                     + `<h3>Click following link to reset limit.</h3>`
                     + `<p><a href='${resetLink}'>Reset Server</a></p>`;

        // build mail options
        // to : we are sending to ourselves
        const mailOptions = {
            from: 'info@jamisolutions.com',
            to: crypt.decrypt(data.to),
            subject : 'CONTACT FORM LIMIT WARNING',
            html
        };

        // send email using data and transporter provided
        return await transporter.sendMail(mailOptions);
    } catch (error)
    {
        console.error(error);
        return error;
    }
};

 module.exports = { getEmailAuth, getTransporter, sendEmail, sendMailExceedLimit, sendMailWarningLimit }; 