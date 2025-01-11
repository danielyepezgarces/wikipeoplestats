# Introduction
WikiPeopleStats is a project to measure the gender gap on Wikimedia wikis

Live: https://wikipeoplestats.org/

Docs: Coming soon

API Docs: Coming soon

# Supported projects
* Wikidata
* Wikipedia (341)
* Wikiquote (97)
* Wikisource (80)
# Update period
Initially, there is no stipulated update period, that means that I run the bot to update the information whenever I can and at the same time QLever updates its dump which is approximately every 3-4 days
# Data source
WikiPeopleStats use [QLever](https://github.com/ad-freiburg/qlever) API to extract the need info, i decided not to use it because the Blazegraph engine that [Wikidata Query Service](https://query.wikidata.org/) uses is very obsolete or incapable of processing the volume of data that is extracted and despite using the [QLever demo](https://qlever.cs.uni-freiburg.de/wikidata) since there is no official instance of Wikidata using QLever, it has helped me to continue working on the project.
# Data usage
My project stores the following parameters in the database
* Wikidata Item ID
* Gender (P21)
* Birth date (P569)
* Death date (P570)
* Country (P17) taken from birth place (P19)
> [!NOTE]
> The idea is to fully automate the update soon, if you want to contribute to this functionality I am willing to work on it and receive that help.
# Requirements
## Technical
* MariaDB 11.4 or MySQL 8.0
* Memcached 1.6
* Apache 2.4
* PHP 8.4
* Python 3.13 (bot usage)
## Hardware
* 8 GB RAM (Webservice + Cache)
* 8 GB RAM (Database)
* 4 vCPU
* 50 GB Disk

# Licence
Copyright © 2024 Daniel Yepez Garces.

WikiPeopleStats source code is licensed under [GPL 3.0 or later](https://www.gnu.org/licenses/gpl-3.0.html).
