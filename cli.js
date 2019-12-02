#!/usr/bin/env node

const config = require("./config");
const lib = require("./lib");

lib
  .scrapeBreaches(config.server, config.outdir, config.maxBreaches)
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
