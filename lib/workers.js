/*
 *  Workers-related task
 *
 */

// Dependencies
const path = require("path");
const fs = require("fs");
const _data = require("data");
const http = require("http");
const helpers = require("helpers");
const url = require("url");

// Initiate the workers module object
var workers = {};

// Lookup all checks, get their data, send to a validator
workers.getherAllChecks = () => {
    // Get all checks
    _data.list("checks", (err, checks) => {
        if (!err && checks && checks.length > 0) {
            console.log("Hello");
        } else {
            console.log("Couldn't find any checks to process");
        }
    });
};

workers.loop = () => {
    setInterval(() => {
        workers.getherAllChecks();
    }, 1000 * 60);
};

// Init func
workers.init = () => {
    // Execute all the checks
    workers.getherAllChecks();
    // Call the loop so the check will execute later on
    workers.loop();
};
// Export the module
module.exports = workers;
