const { createServer } = require("http");

const client = require('prom-client');
const bent = require('bent')

const targetURL = process.env.TARGET_URL || 'http://localhost/';
const targetMethod = process.env.TARGET_METHOD ||  'GET';
const expectedCode = parseInt(process.env.TARGET_CODE || '200');

const checkHealth = bent(targetURL, targetMethod, 'string');

new client.Gauge({
  name: 'up',
  help: 'Did the healthcheck pass. Binary 0/1',
  async collect() {
    let passed = false;

    try {
        await checkHealth();
        passed = true;
    } catch (error) {
        console.log(error)
        if (error.statusCode === expectedCode) {
            passed = true;
        }
    }

    this.set(passed ? 1 : 0);
  },
});

createServer((req, res) => {
  switch (req.url) {
    case "/metrics":
        client.register.metrics().then(output => res.end(output))
        break;
    default:
        res.statusCode = 404;
        res.end("Page not found!");
  }
}).listen(parseInt(process.env.EXPORTER_PORT));
