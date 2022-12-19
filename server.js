"use strict";

const app = require("./app");
const {PORT} = require("./express-app/util/config");

module.exports = app.listen(PORT, function () {
    console.log(`Started on http://localhost:${PORT}`);
});
