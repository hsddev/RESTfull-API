/*
 *  Workers-related task
 *
 */

// Dependencies
const path = require("path");
const fs = require("fs");
const data = require("data");
const http = require("http");
const helpers = require("helpers");
const url = require("url");

// Initiate the workers module object
var workers = {};

// Export the module
