/*
* Library for storing and editing data
*
*/

// Dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// Container for the module (to be exported)
var lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname,"/../.data/");

// Write data from a file
lib.create = (dir,file,data,callback)=>{
    // Open file for writing
    fs.open(lib.baseDir+dir+ "/" +file+".json","wx",(err,fileDescriptor)=>{
        if(!err && fileDescriptor) {
            // Convert data to a string
            const dataString = JSON.stringify(data);

            // write to file and close it
            fs.writeFile(fileDescriptor,dataString,(err)=>{
                if(!err){
            fs.close(fileDescriptor,(err)=>{
                if(!err){
                    callback(false);
                } else {
                    callback("Error closing new file");
                }
            });
                }else {
            callback("Error writing to new file");
                }
            });
        }else {
            callback("Couldn't create the file, may already exist !");
        }
    });
};

// Read data from a file
lib.read = (dir,file,callback)=>{
    fs.readFile(lib.baseDir+dir+"/"+file+".json","utf8", (err,data)=>{
        if(!err && data){
            var parsedData = helpers.parseJsonToObject(data);

            callback(false,parsedData);

        }else {
            callback(err,data);
        }
        
    });
};

// Update an existing file
lib.update = (dir,file,data,callback)=>{
    // Open file to edit it
    fs.open(lib.baseDir+dir+"/"+file+".json", "r+", (err,fileDescriptor)=>{
        if(!err && fileDescriptor){
var dataString = JSON.stringify(data);

fs.ftruncate(fileDescriptor, (err) =>{
    if (!err){

        fs.writeFile(fileDescriptor,dataString, (err) =>{
            if(!err) {
                fs.close(fileDescriptor, (err) =>{
                    if(!err){
                        callback(false);

                    }else {
                        callback("Error close the existing file");
                    }
                });

            }else {
                callback("Error writing the existing file");
            }
        });

    } else {
        callback("Error truncating file");

    }

});

        }else {
            callback("Couldn't update the file, it may not exist !");
        }
    });
};

lib.delete = (dir,file,callback)=>{
    fs.unlink(lib.baseDir+dir+"/"+file+".json", (err)=>{
        if(!err){
            callback(false);
        } else{
            callback("Error deleting existing file, it may not be exist !");

        }
    });
};
// Export the module
module.exports = lib;