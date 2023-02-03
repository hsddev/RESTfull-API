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
const path = require("path");
const fs = require("fs");

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

// Get the string content of a template
helpers.getTemplate = (templateName, data, callback) => {
    // Check the template name
    templateName =
        typeof templateName == "string" && templateName.length > 0
            ? templateName
            : false;

    data = typeof data == "object" && data != null ? data : {};

    if (templateName) {
        var templateDir = path.join(__dirname, "/../templates/");
        fs.readFile(
            templateDir + templateName + ".html",
            "utf-8",
            (err, content) => {
                if (!err && content && content.length > 0) {
                    // Do the interpolation on the string
                    var finalString = helpers.interpolate(content, data);
                    callback(false, finalString);
                } else {
                    callback("No template could be found");
                }
            }
        );
    } else {
        callback("A valid template name was not specified");
    }
};

// Add the universal header and footer to the string and pass provided data object to footer and header for interpolation
helpers.addUniversalTemplate = (str, data, callback) => {
    str = typeof str == "string" && str.length > 0 ? str : "";
    data = typeof data == "object" && data != null ? data : {};
    // Get the header
    helpers.getTemplate(str, data, (err, headerString) => {
        if (!err && headerString) {
            // Get the footer
            helpers.getTemplate(str, data, (err, footerString) => {
                if (!err && footerString) {
                    var finalString = headerString + str + footerString;
                    callback(false, finalString);
                } else {
                    callback("Couldn't find the footer template");
                }
            });
        } else {
            callback("Couldn't find the header template");
        }
    });
};

// Take a given string and data object and find/replace all keys within it
helpers.interpolate = (str, data) => {
    str = typeof str == "string" && str.length > 0 ? str : "";
    data = typeof data == "object" && data != null ? data : {};

    // Add the templateGlobals to the data object, prepending their key name with global
    for (var keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data["global." + keyName] = config.templateGlobals[keyName];
        }
    }

    // For each key in data object, insert it value into string at the correct order
    for (var key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] == "string") {
            var replace = data[key];
            var find = "{" + key + "}";

            str = str.replace(find, replace);
        }
    }

    return str;
};

// Export module
module.exports = helpers;
