const { createServer } = require("http");
const next = require("next");

const app = next({ dev: false });
const handle = app.getRequestHandler();

const port = process.env.PORT || 8080;

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, "0.0.0.0", () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
});
