/*
 *  Create and export configuration environments
 *
 */
var environments = {};

// Define the staging environments
environments.staging = {
    port: 3000,
    envName: "staging",
    hashingSecret: "xs007n",
    maxChecks: 5,
    twilio: {
        accountSid: "AC68d6c371e5df7c16d9098b981e89e808",
        authToken: "51d77568f2ce0f607395eba8a0da6461",
        fromPhone: "+19205673464",
    },
    templateGlobals: {
        appName: "JDDEV",
        companyName: "JDDEV",
        yearCreated: "2022",
        baseUrl: "http://localhost:3000/",
    },
};

// Define the production environments
environments.production = {
    port: 5000,
    envName: "production",
    hashingSecret: "xs007n",
    maxChecks: 5,
    twilio: {
        accountSid: "AC68d6c371e5df7c16d9098b981e89e808",
        authToken: "51d77568f2ce0f607395eba8a0da6461",
        fromPhone: "+447862752539",
    },
    templateGlobals: {
        appName: "JDDEV",
        companyName: "JDDEV",
        yearCreated: "2022",
        baseUrl: "http://localhost:5000/",
    },
};

// Determine with environment was passed in the command line argument
var currentEnvironment =
    typeof process.env.NODE_ENV == "string"
        ? process.env.NODE_ENV.toLowerCase()
        : "";

// Check if the current environment is one of the environment above, if not default staging
var environmentToExport =
    typeof environments[currentEnvironment] == "object"
        ? environments[currentEnvironment]
        : "staging";

// Export environment
module.exports = environmentToExport;
