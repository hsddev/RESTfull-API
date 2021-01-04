//Dependencies
const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./lib/config");
const _data = require("./lib/data");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");

// Testing
// @TODO delete this
// _data.delete("test", "newFile",(err)=>{
//          console.log("This is the error", err);
// });

//Create server that respond to all requests with a string
const server = http.createServer((req,res)=>{

    // Get the url and parse it
    const parsedUrl = url.parse(req.url,true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimedPath = path.replace(/^\/+|\/+$/g,"");

    // Get query string
    const queryStringObject = parsedUrl.query;

    // Get HTTP method
    const method = req.method;

    // Get the Headers object
    const headers = req.headers;

    // Get the Payload, if any
    const decoder = new StringDecoder("utf-8");
    buffer = "";

    req.on("data", data => {
        buffer += decoder.write(data);
    });

    req.on("end", ()=> {

        buffer += decoder.end();

        // Choose a handler this request should go, if not go to notFound handler
        var chosenHandler = typeof(router[trimedPath]) !== "undefined" ? router[trimedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            "trimedPath": trimedPath,
            "queryStringObject" : queryStringObject,
            "headers" : headers,
            "method" : method,
            "payload" : helpers.parseJsonToObject(buffer),
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload)=>{

            // Use the statusCode called back by the handler, or by default to 200
            statusCode = typeof(statusCode) == "number" ? statusCode : 200;

            // Use the payload called back by the handler, or by default to an empty object
            payload = typeof(payload) == "object" ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader("Content-type","application/json");
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request path
       console.log("Returning this response: " + statusCode, payloadString );

        });

        
    });
    
});

//Start the server, and listen to the port 3000
server.listen(config.port,()=>{
    console.log("Listening to port " + config.port + " with environment " + config.envName);
});

// Define a request router
var router = {
    "sample" : handlers.sample,
    "users" : handlers.users,
    "tokens" : handlers.tokens
};