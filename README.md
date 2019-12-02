# blurts-logo-scraper

Scrape breach details logos using Puppeteer.

## USAGE

Since this invokes Puppeteer (a 100MB-ish Chromium penalty), it's probably best to clone this repo locally and run the script versus trying to use `npx` and redownload the puppeteer/Chromium binary repeatedly.

```sh
git clone https://github.com/pdehaan/blurts-logo-scraper.git
cd blurts-logo-scraper
npm install
npm run scrape
```

If you want to run against a non-production environment, you can specify a `SERVER=` ENV var, or `--server` argument on the CLI to a development/stage server instead:

```sh
SERVER=https://fx-breach-alerts.herokuapp.com/ npm scrape

# OR

npm run scrape -- --server=https://fx-breach-alerts.herokuapp.com/

# OR

npm run scrape:dev # which sets --server=https://fx-breach-alerts.herokuapp.com/ for you.
```

By default, all breaches will be scraped and generated screenshots will be saved to (and minified from) the "./shots/" directory.
If you want to customize this behavior, there are two other attributes you can set:

| ENV var | Argument | Description | Default |
|:--------|:---------|:------------|:--------|
| `OUTDIR` | `--outdir` | Directory to write screenshots to. | "./shots"
| `MAX_BREACHES` | `--max-breaches` | Maximum number of breaches to scrape. | `undefined` (all breaches)
