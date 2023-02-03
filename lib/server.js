/*
 * Server related-tasks
 */

// Dependencies
const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const handlers = require("./handlers");
const helpers = require("./helpers");

// Instantiate the server module object
var server = {};

// Instantiate HTTP server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

// Server login
server.unifiedServer = (req, res) => {
    // Get the parsed url
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;

    // Get the path trimmed
    const trimmedPath = path.replace(/^\//g, "");

    // Get the query string as an Object
    const queryString = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toLowerCase();

    // Get the headers
    const headers = req.headers;

    // Get the payload, if there is any
    const decoder = new StringDecoder("utf-8");
    let buffer = "";

    req.on("data", (data) => {
        buffer += decoder.write(data);
    });

    req.on("end", () => {
        buffer += decoder.end();

        // Choose the handler this request should go to, if one is not founder use the notFound handler
        var chosenHandler =
            typeof server.router[trimmedPath] !== "undefined"
                ? server.router[trimmedPath]
                : handlers.notFound;

        // Construct the data object to send it to the handler
        var data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryString,
            headers: headers,
            method: method,
            payload: helpers.parseJsonToObj(buffer),
        };

        // Route the request to the handler
        chosenHandler(data, (statusCode, payload, contentType) => {
            // Determine the type of response (fallback to JSON)
            contentType = typeof contentType == "string" ? contentType : "json";
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof statusCode === "number" ? statusCode : 200;

            // return the response-parts that are content specific
            var payloadString = "";
            if (contentType == "json") {
                res.setHeader("Content-Type", "application/json");
                payload = typeof payload === "object" ? payload : {};
                // Convert the payload to a string
                payloadString = JSON.stringify(payload);
            }
            if (contentType == "html") {
                res.setHeader("Content-Type", "text/html");
                payloadString = typeof payload === "string" ? payload : "";
            }

            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the statusCode and the payload
            console.log(statusCode, payloadString);
        });
    });
};

// Define a request router
server.router = {
    "": handlers.index,
    "account/create": handlers.accountCreate,
    "account/edit": handlers.accountEdit,
    "account/deleted": handlers.accountDeleted,
    "session/create": handlers.sessionCreate,
    "session/deleted": handlers.sessionDeleted,
    "checks/all": handlers.checkList,
    "checks/create": handlers.checksCreate,
    "checks/edit": handlers.checkEdit,
    ping: handlers.ping,
    "api/users": handlers.users,
    "api/tokens": handlers.tokens,
    "api/checks": handlers.checks,
};

// Init script
server.init = () => {
    // Start the server and make it listen to port 3000
    server.httpServer.listen(config.port, () => {
        console.log(
            `Start listening to port ${config.port} in ${config.envName} mode`
        );
    });
};

// module export
module.exports = server;
