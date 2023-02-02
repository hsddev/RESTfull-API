/*
 *
 * Library to store and edit data
 *
 */

// Dependencies
const path = require("path");
const fs = require("fs");
const helpers = require("./helpers");

// Container for the module
var lib = {};

// Base directory for data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// Write data to a file
lib.create = (dir, filename, data, callback) => {
    // Open the file for writing
    fs.open(
        lib.baseDir + dir + "/" + filename + ".json",
        "wx",
        (err, fileDesc) => {
            if (!err && fileDesc) {
                // Convert data to string
                var stringData = JSON.stringify(data);

                // Write to file and close it
                fs.write(fileDesc, stringData, (err) => {
                    if (!err) {
                        // Close the file
                        fs.close(fileDesc, (err) => {
                            if (!err) {
                                callback(false);
                            } else {
                                callback("Error closing a new file");
                            }
                        });
                    }
                });
            } else {
                callback("Couldn't create a new file, it may already exists !");
            }
        }
    );
};

// Read data from a file
lib.read = (dir, filename, callback) => {
    fs.readFile(
        lib.baseDir + dir + "/" + filename + ".json",
        "utf-8",
        (err, data) => {
            if (!err && data) {
                var parsedData = helpers.parseJsonToObj(data);
                callback(false, parsedData);
            } else {
                callback(err, data);
            }
        }
    );
};

// Update the data inside the file
lib.update = (dir, filename, data, callback) => {
    // Open the file for reading
    fs.open(
        lib.baseDir + dir + "/" + filename + ".json",
        "r+",
        (err, fileDesc) => {
            if (!err && fileDesc) {
                // Convert data to a string
                var stringData = JSON.stringify(data);

                // Truncate the file
                fs.truncate(fileDesc, (err) => {
                    if (!err) {
                        // Write the file and close it
                        fs.write(fileDesc, stringData, (err) => {
                            if (!err) {
                                // Close the file
                                fs.close(fileDesc, (err) => {
                                    if (!err) {
                                        callback(false);
                                    } else {
                                        callback("Error closing a new file");
                                    }
                                });
                            }
                        });
                    } else {
                        callback("Error truncate the file");
                    }
                });
            } else {
                callback("Couldn't open the file, it may the file not exists!");
            }
        }
    );
};

// Delete a file
lib.delete = (dir, filename, callback) => {
    // Unlink the file
    fs.unlink(lib.baseDir + dir + "/" + filename + ".json", (err) => {
        if (!err) {
            callback(false);
        } else {
            callback("Error deleting the file");
        }
    });
};

// List all items in a directory
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir + dir + "/", (err, data) => {
        if (!err && data && data.length > 0) {
            var trimmedFileNames = [];
            data.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace(".json", ""));
            });
            callback(false, trimmedFileNames);
        }
    });
};

// Export the module
module.exports = lib;
