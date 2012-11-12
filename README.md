# DistScraper

DistScaper retrieves where the various images (.iso files) are located for a number of Linux distributions. It is being used for DriveDroid to show a list of downloadable images.

The distributions that are supported at the moment are:

* Ubuntu
* Debian
* ArchLinux
* OpenSUSE
* Fedora

## Installation

    $ git clone git://github.com/FrozenCow/distscraper.git
    $ cd distscraper
    $ npm install

## Usage

To let distscaper retrieve all images of all distributions, execute:

    $ node index.js

To let distscaper only retrieve specified distributions, for example only Debian, execute:

    $ node index.js debian

