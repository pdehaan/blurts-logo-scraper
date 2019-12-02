const convict = require("convict");

const config = convict({
  server: {
    doc: "Remote server to scrape.",
    format: "url",
    default: "https://monitor.firefox.com/",
    env: "SERVER",
    arg: "server"
  },
  outdir: {
    doc: "Directory to write screenshots to.",
    format: String,
    default: "./shots",
    env: "OUTDIR",
    arg: "outdir"
  },
  maxBreaches: {
    doc: "Maximum number of breaches to scrape.",
    format: "int",
    default: undefined,
    env: "MAX_BREACHES",
    arg: "maxBreaches"
  }
});

config.validate({ allowed: "strict" });

module.exports = Object.freeze(config.getProperties());
