const path = require("path");

const cliProgress = require("cli-progress");
const HIBP = require("hibp-chain-api");
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const puppeteer = require("puppeteer");

module.exports = {
  getBreaches,
  minifyImages,
  progressBar,
  scrapeBreaches
};

/**
 * Fetch the latest breaches from the server.
 * @param {int} limit Maximum number of breaches to return.
 * @returns {array} An array of breaches.
 */
async function getBreaches(limit) {
  return new HIBP().getBreaches().then(breaches =>
    breaches
      .sort("Name")
      .pluck("Name")
      .breaches(limit)
  );
}

/**
 * Minify a glob of files to disk.
 * @param {array} glob A glob of images to minify.
 * @param {*} dest Destination folder to write images to.
 */
async function minifyImages(glob = [], dest = ".") {
  const pngPlugin = imageminPngquant({ quality: [0.6, 0.8] });
  return imagemin(glob, {
    destination: dest,
    plugins: [pngPlugin]
  });
}

/**
 * Create a new CLI progress bar instance.
 * @param {string} prefix Format string prefix.
 * @param {string} suffix Format string suffix.
 * @returns {cliProgress.SingleBar} Progress bar instance.
 */
function progressBar(
  prefix = "Downloading screenshots...",
  suffix = "breach: {file}"
) {
  const format = `${prefix} {bar} {value}/{total} ({percentage}%) | ETA: {eta}s | ${suffix}`;
  return new cliProgress.SingleBar(
    {
      clearOnComplete: true,
      emptyOnZero: true,
      format,
      hideCursor: true
    },
    cliProgress.Presets.shades_classic
  );
}

/**
 * Wrapper function for downloading and minifying screenshots.
 * @param {string} server Remote server to scrape.
 * @param {string} outdir Directory to write screenshots to.
 * @param {number} limit Maximum number of breaches to scrape.
 */
async function scrapeBreaches(
  server = "https://monitor.firefox.com/",
  outdir = "./shots",
  limit
) {
  await timeFn("Downloaded screenshots", async () =>
    downloadImages(server, outdir, limit)
  );
  await timeFn("Minified screenshots", async () =>
    minifyImages([`${outdir}/*.png`], outdir)
  );
}

/**
 * Download breach images from the specified server and save image to the specified output directory.
 * @param {string} server Remote server to scrape.
 * @param {string} outdir Directory to write screenshots to.
 * @param {number} limit Maximum number of breaches to scrape.
 * @param {boolean} autoMinify Call imagemin after downloading the screenshot.
 */
async function downloadImages(server, outdir, limit, autoMinify = false) {
  const breaches = await getBreaches(limit);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const pbar = progressBar();

  pbar.start(breaches.length, 0);
  for (const breach of breaches) {
    const outfile = path.join(outdir, `${breach.Name}.png`);
    pbar.increment(1, { file: breach.Name });
    const href = new URL(`/breach-details/${breach.Name}`, server).href;
    await page.goto(href, { waitUntil: "networkidle0" });
    const el = await page.$("main#breach-detail .flx-cntr");
    await el.screenshot({ path: outfile });
    if (autoMinify) {
      // Minify each image and rewrite to disk...
      await minifyImages([outfile], outdir);
    }
  }
  pbar.stop();
  browser.close();
}

/**
 * Wrapper function for `console.time()`...`console.timeEnd()`.
 * @param {string} label `console.time` label.
 * @param {*} fn Function to time.
 */
async function timeFn(label = "", fn = () => true) {
  console.time(label);
  await fn();
  console.timeEnd(label);
}
