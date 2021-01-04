/*
* Request handlers
*
*/

// Dependencies
var _data = require("./data");
var helpers = require("./helpers");

// Container for all handlers 
var handlers = {};

// Sample handler
handlers.sample = (data,callback)=>{
    callback(406,{ "name" : "Sample Handler"});
};

// Not Found handler
handlers.notFound = (data,callback)=>{
    callback(404);
};

// Users handler
handlers.users = (data,callback) => {
    var acceptableMethods = ["GET","POST","PUT","DELETE"];

    if(acceptableMethods.indexOf(data.method) > -1){

        handlers._users[data.method](data,callback);

    } else {
        callback(405, {"Error" : "Not acceptable"});
    }

};

// Container of users submethods
handlers._users = {};

// Users - post
// Required data: firstname, lastname, phone, password, tosAgreement
// Optional data: none
handlers._users.POST = (data,callback)=>{
    // Check required fields are filled out

    console.log(data.payload);

    var firstName = typeof(data.payload.firstName == "string") && (data.payload.firstName || '').trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName == "string") && (data.payload.lastName || '').trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone == "string") && (data.payload.phone || '').trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password == "string") && (data.payload.password || '').trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement == "boolean") && data.payload.tosAgreement == true ? true : false;
if(firstName && lastName && phone && password && tosAgreement){
    
    // Make sure that the user doesn't exist
    _data.read("users", phone, (err, data)=>{
        if(err){
            // Hash the password
            var hashedPassword = helpers.hash(password);

            if(hashedPassword) {
                
            // Create users object
            var userObject = {
                "firstname": firstName,
                "lastname": lastName,
                "phone": phone,
                "password": hashedPassword,
                "tosAgreement" : true
            };

            _data.create("users", phone, userObject, err =>{
                if(!err){
                    callback(200);

                }else {
                    console.log(err);
                    callback(500,{"Error" : "Couldn't create the new user"});

                }
            });

            }else {
                callback(500, {"Error" : "Couldn't hash the user\'s password"});

            }



        }else {
            callback(400, { "Error" : "An user with that phone number already exist"});
        }

    });

}else{
    callback(404,{"Error": "Missing required fields"})
}

};
// Users - get
// Required data: phone
// Optional data: none
// @TUDO let an authenticated user access to their object, Don't let him enter to anyone object
handlers._users.GET = (data,callback)=>{
    // Check if phone number is valid
    var phone = typeof(data.queryStringObject.phone == "string") && (data.queryStringObject.phone || '').length == 10 ? data.queryStringObject.phone : false;

    if(phone){
        _data.read("users",phone,(err,data)=>{
            if(!err && data){
                // Remove the hashed password from the object before returning it to the requester
                delete data.password;
                callback(200, data);

            }else {
                callback(404);
            }
        });
    }else {
        callback(404,{"Error": "Missing required fields"});
    }

};

// Users - put
// Required: phone
// Optional data: firstname, lastname, password (at least one specified)
handlers._users.PUT = (data,callback)=>{
    // Check if phone number exist
    var phone = typeof(data.payload.phone == "string") && (data.payload.phone || '').length == 10 ? data.payload.phone : false;

    // Check for the required fields
    var firstName = typeof(data.payload.firstName == "string") && (data.payload.firstName || '').trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName == "string") && (data.payload.lastName || '').trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password == "string") && (data.payload.password || '').trim().length > 0 ? data.payload.password.trim() : false;

    if(phone){
        // Error if nothing to update
        if(firstName || lastName || password){
            // Lookup for the user
            _data.read("users",phone,(err,userData)=>{
                // Update field necessary
                if(!err && userData){
                    if(firstName){
                        userData.firstname = firstName;
                    };

                    if(lastName){
                        userData.lastname = lastName;
                    };

                    if(password){
                        userData.password = helpers.hash(password);
                    };
                    _data.update("users", phone, userData , (err) =>{
                        if(!err){
                            callback(200);

                        }else{
                            console.log(err);
                            callback(500,{"Error":"Couldn\'t update the user"})
                        }
                    });

                }else{
                    callback(400,{"Error": "The specified user may not be exist"});

                }
            });


        }else {
            callback(400,{"Error": "Missing fields to update"});
        }


    }else {
        callback(404,{"Error": "Missing required fields"});
    }

};

// Users - delete
// Required: phone
// @TUDO only let an authenticated user delete there object, don't let them delete other else's
// @TUDO cleanup any other data file associated with this user
handlers._users.DELETE = (data,callback)=>{

    // Check if phone number is valid
    var phone = typeof(data.queryStringObject.phone == "string") && (data.queryStringObject.phone || '').length == 10 ? data.queryStringObject.phone : false;

    if(phone){
        _data.read("users",phone,(err,data)=>{
            if(!err && data){
                
                // Delete the user
                _data.delete("users",phone,(err)=>{
                    if(!err){
                        callback(200);
                    }else{
                        console.log(err);
                        callback(500,{"Error": "Couldn\'t delete the specified user"});
                    }
                });

            }else {
                callback(404,{"Error":"Couldn\'t find the specified user"});
            }
        });
    }else {
        callback(404,{"Error": "Missing required fields"});
    }

};


// Tokens handler
handlers.tokens = (data,callback) => {
    var acceptableMethods = ["GET","POST","PUT","DELETE"];

    if(acceptableMethods.indexOf(data.method) > -1){

        handlers._tokens[data.method](data,callback);

    } else {
        callback(405, {"Error" : "Not acceptable"});
    }

};

// Container of all tokens methods
handlers._tokens = {};


// Tokens - post
// Required: phone, password
// Optional data: none
handlers._tokens.POST = (data,callback)=>{
    var phone = typeof(data.payload.phone) == "string" && (data.payload.phone || "").length == 10 ? data.payload.phone : false;
    var password = typeof(data.payload.password) == "string" && (data.payload.password || "").length > 0 ? data.payload.password : false;

    if(phone && password){
        // Check if user exist
        _data.read("users", phone, (err,userData)=>{
            if(!err && userData){
                // Hash the sent password and compare it with user password
                if(userData.password == helpers.hash(password)){
                    // If it valid then create a token with a random name, set expiration date 1 hour in the future
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;

                    var tokenObject = {
                        "phone" : phone,
                        "id" : tokenId,
                        "expires" : expires

                    };

                    _data.create("tokens", tokenId, tokenObject, (err) => {
                        if(!err){
                            callback(200, tokenObject);
                        }else {
                            callback(400, {"Error": "Couldn\'t create the new token."})
                        }

                    });
                }else {
                    callback(400,{"Error": "Wrong password"})
                }


            }else {
                callback(400,{"Error": "The specified user not exist"});
            }

        });

    }else {
        callback(400,{"Error": "Missing required field(s)"})

    }
};

// Tokens - get
// Required : id
// Optional data : none
handlers._tokens.GET = (data,callback)=>{
        // Check if phone number is valid
        var tokenId = typeof(data.queryStringObject.id == "string") && (data.queryStringObject.id || '').length == 20 ? data.queryStringObject.id : false;

        if(tokenId){
            _data.read("tokens",tokenId,(err,tokenData)=>{
                if(!err && tokenData){
                    // Returning data to the requester
                    callback(200, tokenData);
    
                }else {
                    callback(404);
                }
            });
        }else {
            callback(404,{"Error": "Missing required fields"});
        } 
};

// Tokens - put
// Required : id, extend
// Optional data: none
handlers._tokens.PUT = (data,callback)=>{
    var id = typeof(data.payload.id) == "string" && (data.payload.id || "").length == 20 ? data.payload.id : false;
    var extend = typeof(data.payload.extend) == "boolean" ? data.payload.extend == true : false;

    if(id && extend){
        _data.read("tokens",id,(err,tokenData)=>{
            if(!err && tokenData){
                // Make sure that the token is not already expired
                if(tokenData.expires > Date.now()){
                    // Set the expiration date an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new update
                    _data.update("tokens", id, tokenData, (err)=>{
                        if(!err){
                            callback(200);
                        }else {
                            callback(400,{"Error":"Could not update the token"});
                        }
                    });

                }else {
                    callback(400,{"Error": "Token already expired and could not be extended"})
                }

            }else {
                callback(400,{"Error": "Specified token not exist"});
            }
        });

    }else {
        callback(400,{"Error":"Missing required fields or field(s) are invalid"});
    }
};

// Tokens - delete
// Required: id
// Optional data : none
handlers._tokens.DELETE = (data,callback)=>{
    // Check if id exist
    var id = typeof(data.queryStringObject.id == "string") && (data.queryStringObject.id || '').length == 20 ? data.queryStringObject.id : false;

    if(id){
        _data.read("tokens",id,(err,data)=>{
            if(!err && data){
                
                // Delete the token
                _data.delete("tokens",id,(err)=>{
                    if(!err){
                        callback(200);
                    }else{
                        console.log(err);
                        callback(500,{"Error": "Couldn\'t delete the specified token"});
                    }
                });

            }else {
                callback(404,{"Error":"Couldn\'t find the specified token"});
            }
        });
    }else {
        callback(404,{"Error": "Missing required fields"});
    }
};


module.exports = handlers;