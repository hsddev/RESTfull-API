/*
 *  Request handlers
 *
 */
// Dependencies
const { type } = require("os");
const _data = require("./data");
const helpers = require("./helpers.js");
const config = require("./config");

// Define a handler
var handlers = {};

// Sample handler
handlers.ping = (data, callback) => {
    // Callback a http status code , and a payload object
    // callback(406, { name: "Sample handler" });
    callback(200);
};

// Users handler
handlers.users = (data, callback) => {
    // Acceptable http request
    const acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the user sub-method
handlers._users = {};

// Users - post
// Required data: firstName, lastName, userName, email, phone, password
// Optional data: none
handlers._users.post = (data, callback) => {
    // Check the required fields are filled out
    var firstName =
        typeof data.payload.firstName == "string" &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;

    var lastName =
        typeof data.payload.lastName == "string" &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;

    var userName =
        typeof data.payload.userName == "string" &&
        data.payload.userName.trim().length > 0
            ? data.payload.userName.trim()
            : false;

    var email =
        typeof data.payload.email == "string" &&
        data.payload.email.trim().length > 0
            ? data.payload.email.trim()
            : false;

    var phone =
        typeof data.payload.phone == "string" &&
        data.payload.phone.trim().length == 10
            ? data.payload.phone.trim()
            : false;

    var password =
        typeof data.payload.password == "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    if (firstName && lastName && userName && email && password && phone) {
        // Make sure that the user doesn't already exist
        _data.read("users", phone, (err, data) => {
            if (err) {
                // Hash the password
                var hashedPassword = helpers.hash(password);

                // Create the user object
                var userObject = {
                    firstName,
                    lastName,
                    userName,
                    email,
                    phone,
                    password: hashedPassword,
                };

                _data.create("users", phone, userObject, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        console.log(err);
                        callback(500, "Error: Couldn't create the new user");
                    }
                });
            } else {
                callback(400, {
                    Error: "A user with that phone number already exists",
                });
            }
        });
    } else {
        callback(400, { Error: "Missing required fields" });
    }
};
// Users - get
// Required data:
// Optional data : none
handlers._users.get = (data, callback) => {
    // Check if the phone number is valid
    var phone =
        typeof data.queryStringObject.phone == "string" &&
        data.queryStringObject.phone.trim().length == 10
            ? data.queryStringObject.phone.trim()
            : false;
    if (phone) {
        // Get the token from the headers
        var token =
            typeof data.headers.token == "string" ? data.headers.token : false;

        // Verify that the give token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read("users", phone, (err, data) => {
                    if (!err && data) {
                        // Remove the hashing password before returning it to the user
                        delete data.password;
                        callback(200, data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(403, { Error: "Missing token in headers" });
            }
        });
    } else {
        callback(400, {
            Error: "Missing required field",
        });
    }
};
// Users - put
// required data: phone
// Optional data: firstName, lastName, password (at least one should be specified)
handlers._users.put = (data, callback) => {
    var phone =
        typeof data.payload.phone == "string" &&
        data.payload.phone.trim().length == 10
            ? data.payload.phone.trim()
            : false;

    // Check the optional data
    var firstName =
        typeof data.payload.firstName == "string" &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;

    var lastName =
        typeof data.payload.lastName == "string" &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;

    var email =
        typeof data.payload.email == "string" &&
        data.payload.email.trim().length > 0
            ? data.payload.email.trim()
            : false;

    var password =
        typeof data.payload.password == "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;
    // Check if the phone number is valid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || email || password) {
            // Get the token from the headers
            var token =
                typeof data.headers.token == "string"
                    ? data.headers.token
                    : false;

            // Verify that the give token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    // Lookup the user
                    _data.read("users", phone, (err, userData) => {
                        if (!err && userData) {
                            // Update the field necessary
                            if (firstName) userData.firstName = firstName;
                            if (lastName) userData.lastName = lastName;
                            if (email) userData.email = email;
                            if (password) userData.password = password;

                            // Store the new updates
                            _data.update("users", phone, userData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {
                                        Error: "Couldn't update user data",
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                Error: "The specified user doesn't exists",
                            });
                        }
                    });
                } else {
                    callback(403, { Error: "Missing token in headers" });
                }
            });
        } else {
            callback(400, { Error: "Missing fields to update" });
        }
    } else {
        callback(400, { Error: "Missing required fields" });
    }
};
// Users - delete
// Required data: phone
handlers._users.delete = (data, callback) => {
    // Check if the phone number is valid
    var phone =
        typeof data.queryStringObject.phone == "string" &&
        data.queryStringObject.phone.trim().length == 10
            ? data.queryStringObject.phone.trim()
            : false;

    // Check if phone is valid
    if (phone) {
        // Get the token from the headers
        var token =
            typeof data.headers.token == "string" ? data.headers.token : false;

        // Verify that the give token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // lookup the user
                _data.read("users", phone, (err, data) => {
                    if (!err && data) {
                        // delete the user
                        _data.delete("users", phone, (err) => {
                            if (!err) {
                                // Delete all the checks associated to that user's
                                var userChecks =
                                    typeof data.checks == "object" &&
                                    data.checks instanceof Array
                                        ? data.checks
                                        : [];

                                var checksToDelete = userChecks.length;

                                if (checksToDelete > 0) {
                                    var checkDeleted = 0;
                                    var deletionErrors = false;

                                    // Loop through the checks
                                    userChecks.forEach((checkid) => {
                                        // Delete the check
                                        _data.delete(
                                            "checks",
                                            checkid,
                                            (err) => {
                                                if (err) {
                                                    deletionErrors = true;
                                                }
                                                checkDeleted++;
                                                if (
                                                    checkDeleted ==
                                                    checksToDelete
                                                ) {
                                                    if (!deletionErrors) {
                                                        callback(200);
                                                    } else {
                                                        callback(500, {
                                                            Error: "Errors encountered while attempting to delete all user's checks, all checks may not been deleted successfully",
                                                        });
                                                    }
                                                }
                                            }
                                        );
                                    });
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(500, {
                                    Error: "Couldn't delete the specified user",
                                });
                            }
                        });
                    } else {
                        callback(400, {
                            Error: "Couldn't find the specified user",
                        });
                    }
                });
            } else {
                callback(403, { Error: "Missing token in headers" });
            }
        });
    } else {
        callback(400, {
            Error: "Missing required field",
        });
    }
};

// Users handler
handlers.tokens = (data, callback) => {
    // Acceptable http request
    const acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the tokens sub-method
handlers._tokens = {};

// Token Get
// Required data: token id
// Optional data : none
handlers._tokens.get = (data, callback) => {
    // Check if the token id is valid
    var id =
        typeof data.queryStringObject.id == "string" &&
        data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;

    if (id) {
        // Lookup the user
        _data.read("tokens", id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {
            Error: "Missing required field",
        });
    }
};

// Token Post
// Required data: phone & password
handlers._tokens.post = (data, callback) => {
    // Check the required data
    var phone =
        typeof data.payload.phone == "string" &&
        data.payload.phone.trim().length == 10
            ? data.payload.phone.trim()
            : false;

    var password =
        typeof data.payload.password == "string" &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    if (phone && password) {
        // Lookup to the user who matches that phone
        _data.read("users", phone, (err, userData) => {
            if (!err && userData) {
                // Hash the sent password and compare it with the hashed password stored in user object
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.password) {
                    // If valid create a new token with a random name, and set the expiration data to 1 hour
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        phone,
                        id: tokenId,
                        expires,
                    };

                    // Store the token
                    _data.create("tokens", tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                Error: "Couldn't create the new token",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error: "Password did not match the specified user's stored in user object",
                    });
                }
            } else {
                callback(400, { Error: "Couldn't get user data" });
            }
        });
    } else {
        callback(400, { Error: "Missing required fields" });
    }
};

// Token Put
// Required data: token id & extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
    // Check the required data
    var id =
        typeof data.payload.id == "string" &&
        data.payload.id.trim().length == 20
            ? data.payload.id.trim()
            : false;
    var extend =
        typeof data.payload.extend == "boolean" && data.payload.extend == true
            ? data.payload.extend
            : false;

    if (id && extend) {
        // Lookup for the token
        _data.read("tokens", id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check to make sure that the token hasn't expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new update
                    _data.update("tokens", id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                Error: "Couldn't update the token's expiration",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error: "The token has already expired, and cannot be extended",
                    });
                }
            } else {
                callback(400, { Error: "The token does not exist" });
            }
        });
    } else {
        callback(400, { Error: "Missing required fields" });
    }
};

// Token Delete
// Required data: token id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
    // Check if the token id is valid
    var id =
        typeof data.queryStringObject.id == "string" &&
        data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;

    // Check if the id is valid
    if (id) {
        // lookup the token
        _data.read("tokens", id, (err, tokenData) => {
            if (!err && tokenData) {
                // delete the token
                _data.delete("tokens", id, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            Error: "Couldn't delete the specified token",
                        });
                    }
                });
            } else {
                callback(400, { Error: "Couldn't find the specified token" });
            }
        });
    } else {
        callback(400, {
            Error: "Missing required field",
        });
    }
};

// Verify if a given toekn id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    // Lookup the token
    _data.read("tokens", id, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Checks handlers
handlers.checks = (data, callback) => {
    // Acceptable http request
    var acceptableMethods = ["get", "put", "post", "delete"];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the all checks methods
handlers._checks = {};

// Check post
// Required data: protocol, url, method, successCode, timeoutSec
// Optional data : none
handlers._checks.post = (data, callback) => {
    // Check the required data
    var protocol =
        typeof data.payload.protocol == "string" &&
        ["http", "https"].indexOf(data.payload.protocol) > -1
            ? data.payload.protocol
            : false;

    var url =
        typeof data.payload.url == "string" &&
        data.payload.url.trim().length > 0
            ? data.payload.url.trim()
            : false;

    var method =
        typeof data.payload.method == "string" &&
        ["get", "post", "put", "delete"].indexOf(data.payload.method) > -1
            ? data.payload.method
            : false;

    var successCode =
        typeof data.payload.successCode == "object" &&
        data.payload.successCode instanceof Array &&
        data.payload.successCode.length > 0
            ? data.payload.successCode
            : false;

    var timeoutSec =
        typeof data.payload.timeoutSec == "number" &&
        data.payload.timeoutSec % 1 === 0 &&
        data.payload.timeoutSec >= 1 &&
        data.payload.timeoutSec <= 5
            ? data.payload.timeoutSec
            : false;

    if (protocol && url && method && successCode && timeoutSec) {
        // Get the token from the headers
        var token =
            typeof data.headers.token == "string" &&
            data.headers.token.length == 20
                ? data.headers.token
                : false;

        // Lookup the user from their token
        _data.read("tokens", token, (err, tokenData) => {
            if (!err && tokenData) {
                var userPhone = tokenData.phone;

                // Lookup the user by reading the token
                _data.read("users", userPhone, (err, userData) => {
                    if (!err && userData) {
                        var userChecks =
                            typeof userData.checks == "object" &&
                            userData.checks instanceof Array
                                ? userData.checks
                                : [];

                        // Verify if the user has less than the number of max-checks of each user
                        if (userChecks.length < config.maxChecks) {
                            // Create a random Id for the checks
                            var checkId = helpers.createRandomString(20);

                            // Create the check object and include the user phone
                            var checkObject = {
                                id: checkId,
                                protocol,
                                method,
                                url,
                                successCode,
                                timeoutSec,
                                userPhone,
                            };

                            // Save the object
                            _data.create(
                                "checks",
                                checkId,
                                checkObject,
                                (err) => {
                                    if (!err) {
                                        // Add the checkId to the user object
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);

                                        // Save the user data
                                        _data.update(
                                            "users",
                                            userPhone,
                                            userData,
                                            (err) => {
                                                if (!err) {
                                                    // Return the data about the new check
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        Error: "Couldn't update the user with the new check",
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        callback(500, {
                                            Error: "Couldn't create the new check",
                                        });
                                    }
                                }
                            );
                        } else {
                            callback(400, {
                                Error:
                                    "The user has already the max number of max checks" +
                                    config.maxChecks,
                            });
                        }
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, { Error: "Missing required inputs" });
    }
};

// Checks get
// Required data: check id
// Optional data: none
handlers._checks.get = (data, callback) => {
    // Check the required data
    var checkId =
        typeof data.queryStringObject.id == "string" &&
        data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;
    if (checkId) {
        // Lookup the check
        _data.read("checks", checkId, (err, checkData) => {
            if (!err && checkData) {
                // Get the token from the headers
                var token =
                    typeof data.headers.token == "string" &&
                    data.headers.token.length == 20
                        ? data.headers.token
                        : false;

                // Verify that the give token is valid and belong to the user who want to do the check
                handlers._tokens.verifyToken(
                    token,
                    checkData.userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            // Return the check data
                            callback(200, checkData);
                        } else {
                            callback(403);
                        }
                    }
                );
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {
            Error: "Missing required field",
        });
    }
};

// Checks put
// Required data: check id
// Optional data: protocol, method, url, successCode, timeoutSec (one of them must be sent)
handlers._checks.put = (data, callback) => {
    // Check the required data
    var checkId =
        typeof data.payload.id == "string" &&
        data.payload.id.trim().length == 20
            ? data.payload.id.trim()
            : false;
    // Check the optional data
    var protocol =
        typeof data.payload.protocol == "string" &&
        ["http", "https"].indexOf(data.payload.protocol) > -1
            ? data.payload.protocol
            : false;

    var url =
        typeof data.payload.url == "string" &&
        data.payload.url.trim().length > 0
            ? data.payload.url.trim()
            : false;

    var method =
        typeof data.payload.method == "string" &&
        ["get", "post", "put", "delete"].indexOf(data.payload.method) > -1
            ? data.payload.method
            : false;

    var successCode =
        typeof data.payload.successCode == "object" &&
        data.payload.successCode instanceof Array &&
        data.payload.successCode.length > 0
            ? data.payload.successCode
            : false;

    var timeoutSec =
        typeof data.payload.timeoutSec == "number" &&
        data.payload.timeoutSec % 1 === 0 &&
        data.payload.timeoutSec >= 1 &&
        data.payload.timeoutSec <= 5
            ? data.payload.timeoutSec
            : false;

    // Make sure the id is valid
    if (checkId) {
        // Make sure that the optional data is set
        if (protocol || method || url || successCode || timeoutSec) {
            // Lookup the check
            _data.read("checks", checkId, (err, checkData) => {
                if (!err && checkData) {
                    // Get the token from the headers
                    var token =
                        typeof data.headers.token == "string" &&
                        data.headers.token.length == 20
                            ? data.headers.token
                            : false;

                    // Verify that the give token is valid for the phone number
                    handlers._tokens.verifyToken(
                        token,
                        checkData.userPhone,
                        (tokenIsValid) => {
                            console.log(tokenIsValid);
                            if (tokenIsValid) {
                                // Lookup the check
                                _data.read(
                                    "checks",
                                    checkId,
                                    (err, checkData) => {
                                        if (!err && checkData) {
                                            // Set the new check object
                                            if (protocol)
                                                checkData.protocol = protocol;

                                            if (url) checkData.url = url;

                                            if (method)
                                                checkData.method = method;

                                            if (successCode)
                                                checkData.successCode =
                                                    successCode;

                                            if (timeoutSec)
                                                checkData.timeoutSec =
                                                    timeoutSec;

                                            // Save the new object
                                            _data.update(
                                                "checks",
                                                checkId,
                                                checkData,
                                                (err) => {
                                                    if (!err) {
                                                        callback(
                                                            200,
                                                            checkData
                                                        );
                                                    } else {
                                                        callback(500, {
                                                            Error: "Couldn't update the check data",
                                                        });
                                                    }
                                                }
                                            );
                                        } else {
                                            callback(404);
                                        }
                                    }
                                );
                            } else {
                                callback(403, {
                                    Error: "Missing token in headers",
                                });
                            }
                        }
                    );
                } else {
                    callback(400, { Error: "Check ID does not exist" });
                }
            });
        } else {
            callback(400, { Error: "Missing required fields" });
        }
    } else {
        callback(400, { Error: "Missing required fields" });
    }
};

// Check delete
// Required data: check id
// Optional data: none
handlers._checks.delete = (data, callback) => {
    // Check the required data
    var checkId =
        typeof data.queryStringObject.id == "string" &&
        data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;

    // Check if the check id is valid
    if (checkId) {
        // Lookup the check
        _data.read("checks", checkId, (err, checkData) => {
            if (!err && checkData) {
                // Get the token from the headers
                var token =
                    typeof data.headers.token == "string" &&
                    data.headers.token.length == 20
                        ? data.headers.token
                        : false;

                // Verify that the give token is valid for the phone number
                handlers._tokens.verifyToken(
                    token,
                    checkData.userPhone,
                    (tokenIsValid) => {
                        console.log(tokenIsValid);
                        if (tokenIsValid) {
                            // Delete the check data
                            _data.delete("checks", checkId, (err) => {
                                if (!err) {
                                    //Lookup the user
                                    _data.read(
                                        "users",
                                        checkData.userPhone,
                                        (err, userData) => {
                                            if (!err && userData) {
                                                var userChecks =
                                                    typeof userData.checks ==
                                                        "object" &&
                                                    userData.checks instanceof
                                                        Array
                                                        ? userData.checks
                                                        : [];

                                                // Remove the deleted checks from their list of checks
                                                var checkPosition =
                                                    userChecks.indexOf(checkId);

                                                if (checkPosition > -1) {
                                                    userChecks.splice(
                                                        checkPosition,
                                                        1
                                                    );
                                                    // Re-save the user's data
                                                    _data.update(
                                                        "users",
                                                        checkData.userPhone,
                                                        userData,
                                                        (err) => {
                                                            if (!err) {
                                                                callback(200);
                                                            } else {
                                                                callback(500, {
                                                                    Error: "Couldn't update the user",
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(500, {
                                                        Error: "Couldn't find the check in the user's object, so couldn't remove it",
                                                    });
                                                }
                                            } else {
                                                callback(500, {
                                                    Error: "Couldn't find the user who created the check",
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(500, {
                                        Error: "Couldn't delete the specified user check ID",
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                Error: "Missing token in headers",
                            });
                        }
                    }
                );
            } else {
                callback(400, { Error: "The specified check ID is not exist" });
            }
        });
    } else {
        callback(400, { Error: "Missing required data" });
    }
};
// Not found handler
handlers.notFound = (data, callback) => {
    callback(404, "Not found");
};

// Export module
module.exports = handlers;
