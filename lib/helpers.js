/*
 *
 *  Helpers for various tasks
 *
 */

// Dependencies
const crypto = require("crypto");
const https = require("https");
const querystring = require("querystring");
const config = require("./config");

// Container for all the helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
    if (str.trim().length > 0 && typeof str == "string") {
        var hash = crypto
            .createHmac("sha256", config.hashingSecret)
            .update(str)
            .digest("hex");
        return hash;
    } else {
        return false;
    }
};

// Parse all Json string to an object
helpers.parseJsonToObj = (str) => {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// Create a random string of alphanumeric characters of a given length
helpers.createRandomString = (strLength) => {
    strLength =
        typeof strLength == "number" && strLength > 0 ? strLength : false;

    if (strLength) {
        // Define the possible characters that could be into the string
        var possibleCharacters = "abcdefghijklmnopqrstvwyz0123456789";

        let finalStr = "";

        for (var i = 0; i < strLength; i++) {
            var randomChar = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            finalStr += randomChar;
        }
        return finalStr;
    } else {
        return false;
    }
};

// Send sms message via twilio Api
helpers.sendTwilioSms = (phone, message, callback) => {
    // Validate parameters
    phone =
        typeof phone == "string" && phone.trim().length == 10
            ? phone.trim()
            : false;

    message =
        typeof message == "string" &&
        message.trim().length > 0 &&
        message.trim().length <= 1600
            ? message.trim()
            : false;

    if (phone && message) {
        // Configure the request payload
        var payload = {
            From: config.twilio.fromPhone,
            To: "+44" + phone,
            Body: message,
        };

        // Stringify the payload
        var stringPayload = querystring.stringify(payload);

        // Configure the request details
        var requestDetails = {
            protocol: "https:",
            hostname: "api.twilio.com",
            path:
                "/2010-04-01/Accounts/" +
                config.twilio.accountSid +
                "/Messages.json",
            method: "POST",
            auth: config.twilio.accountSid + ":" + config.twilio.authToken,
            headers: {
                "Content-type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(stringPayload),
            },
        };
        // Instantiate the request object
        var req = https.request(requestDetails, (res) => {
            // Grab the status of the sent request
            var status = res.statusCode;

            // Callback successfully if the request went through
            if (status == 200 || status == 201) {
                callback(false);
            } else {
                callback("Status code returned was " + status);
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on("error", (err) => {
            console.log(err);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();
    } else {
        callback("Given parameters are not valid");
    }
};
// Export module
module.exports = helpers;
