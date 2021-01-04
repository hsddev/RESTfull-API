/*
* Helpers for various tasks 
*
*/

// Dependencies 
const crypto = require("crypto");
const config = require("./config");

// Container for all helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = str => {
    if(typeof(str) == "string" && str.length > 0){
           var hash = crypto.createHmac("SHA256",config.hashingSecret).update(str).digest("hex");
           return hash;
    }else {
        return false;
    }
};

// Parse JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = str => {
try{
var obj = JSON.parse(str);
return obj;
}
catch(e) {
return{}; 
}
};

// Create a random alphanumeric characters, of a given length
helpers.createRandomString = (strLength)=> { 
    strLength = typeof(strLength) == "number" && strLength > 0 ? strLength : false;

    if(strLength){
        // Define possible characters that could go into a string
        var possibleCharacters = "abcdefghijklmnopqrstvwxyz0123456789";

        // Start the final string
        var str = "";

        for(i=1; i<=strLength; i++){
            // Get a random character from the possibleCharacters 
            var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the final string
            str += randomChar;
        }

        // Return the random character
        return str;

    }else {
        return false;
    }

};

// Export helpers
module.exports = helpers;

