// Dependencies
var server = require("./lib/server");
// var workers = require("./lib/workers");

// Declare the app
var app = {};

// Init function
app.init = () => {
    // Start the server
    server.init();
    // Start the workers
    // workers.init();
};

// Execute the app
app.init();

// Export module
module.exports = app;
