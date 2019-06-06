var http = require("http"),
  https = require("https"),
  fs = require("fs"),
  net = require("net"),
  httpProxy = require("http-proxy"),
  url = require("url"),
  util = require("util");

// var proxy = httpProxy.createServer();

http
  .createServer(function(req, res) {
    console.log("Request Listener");
    // console.log(["method", "headers", "url"].map(x => req[x]));
    // method: OPTION
    // 'access-control-request-method': 'GET'
    // origin: 'http://localhost:3000',
    // 'access-control-request-headers': 'authorization'
    if (req.method === "OPTIONS") {
      res.setHeader("access-control-allow-origin", req.headers.origin);
      res.setHeader("access-control-allow-methods", "POST, GET, OPTIONS");
      res.setHeader(
        "access-control-allow-headers",
        req.headers["access-control-request-headers"]
      );
      res.setHeader("access-control-max-age", 86400);
      res.end()
    } else {
      const agent = new https.Agent({
        rejectUnauthorized: false
      });
      const options = {
        hostname: "account-d.docusign.com",
        port: 443,
        path: req.url,
        method: req.method,
        headers: req.headers,
        key: fs.readFileSync("./domain.key"),
        cert: fs.readFileSync("./domain.crt"),
        agent
      };

      const request = https.request(options, response => {
        console.log(`STATUS: ${response.statusCode}`);
        console.log("HEADERS: ", response.headers);
        let data="";
        response.on("data", d => {
          data += d
        });
        response.on("end", () => {
          console.log("data", JSON.parse(data))
          res.setHeader("access-control-allow-origin", req.headers.origin);
          res.writeHead(200, {"Content-Type": "application/json"});
          res.end(data)
        })
      });

      request.on("error", e => {
        console.error(`problem with request: ${e.message}`);
      });

      request.end();
    }

    // proxy.web(req, res, {
    //   target: "https://account-d.docusign.com/" + req.url,
    //   secure: false
    // });
  })
  .listen(8000);

// proxy.on("proxyRes", (proxyRes, req, res) => {
//   console.log("proxyRes");
//   // console.log(["method", "headers", "url"].map(x => req[x]));
//   // Access-Control-Allow-Origin: http://foo.example
//   // Access-Control-Allow-Methods: POST, GET, OPTIONS
//   // Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
//   // Access-Control-Max-Age: 86400
//   if (req.method==="OPTIONS") {
//     console.log("updating res")
//     res.setHeader('access-control-allow-origin', req.headers.origin)
//     res.setHeader('access-control-allow-methods', "POST, GET, OPTIONS")
//     res.setHeader('access-control-allow-headers', req.headers['access-control-request-headers'])
//     res.setHeader('access-control-max-age', 86400)
//   }
// });

// proxy.on("proxyReq", (proxyReq, req, res) => {
//   console.log("proxyReq");
//   // console.log(["method", "headers", "url"].map(x => req[x]));
// });

// proxy.on("end", (req, res, proxyRes) => {
//   console.log("end");
//   // console.log(res.getHeaderNames())
// });
