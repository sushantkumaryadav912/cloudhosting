const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 8080;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res))
    .listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
});
