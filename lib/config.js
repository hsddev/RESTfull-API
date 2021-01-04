// Container all Environments 
var environments = {};

// Staging (default) environment
environments.staging = {
    "port": 3000,
    "envName" : "staging",
    "hashingSecret" : "ThisIsAsecret" 
};

// Production environment
environments.production = {
    "port" : 5000,
    "envName" : "production"
};

// Define the current environment
var currentEnvironment = typeof(process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "";

// Check the current environment is one of the environments above, if not staging environment as default
var environmentToExport = typeof(environments[currentEnvironment]) == "object" ? currentEnvironment : environments.staging;

module.exports = environmentToExport;