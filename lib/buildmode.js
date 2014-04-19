"use strict";

module.exports = process.argv.indexOf("serve") > -1
  ? "dev"
  : "prod";
