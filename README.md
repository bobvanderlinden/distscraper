# DistScraper

DistScaper retrieves where the various images (.iso files) are located for a number of Linux distributions. It is being used for [DriveDroid](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid) to show a list of downloadable images.

The distributions that are supported can be found in [scrapers](https://github.com/FrozenCow/distscraper/tree/master/scrapers).

## Installation

    $ git clone git://github.com/FrozenCow/distscraper.git
    $ cd distscraper
    $ npm install

## Usage

To let distscaper retrieve all images of all distributions, execute:

    $ node index.js

To let distscaper only retrieve specified distributions, for example only Debian, execute:

    $ node index.js debian

Retrieval of logo-images of the different distribution is done through `retrievelogos.sh`. This script downloads images of the distributions from various sources and transforms them to 32x32-PNG logos:

    $ ./retrievelogos.sh

## Contribute

To add new scrapers, look at the different scrapers that are already in place (under `scrapers/`). The output of a scraper should look like `scraper-output.json`.

If you have a new or updated scraper, please do a pull request.
