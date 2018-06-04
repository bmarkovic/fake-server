Fake Server
===========

2018 Bojan Markovic
bmarkovic.79@gmail.com

This is a simple web service written in **Node/Express**
that generates random JSON objects, and occasionally
(statistics are chosen PRNG randomly) responds with
a redirect or an error (4xx or 5xx).

The statisical probabilities for different families of
responses are given:

|Type    |Percentage  |
|--------|------------|
|2xx     |60% - 87%   |
|3xx     |5% - 15%    |
|4xx     |5% - 15%    |
|5xx     |3% - 10%    |

In practice, about 3/4ths of all requests respond with
a randomly generated JSON payload.

Installation
------------

Install the dependencies with `npm`:

    $ npm install

or `yarn`:

    $ yarn

Then simply run the application:

    $ npm run serve

By default it listens on 6000, but you can supply the port
with the `PORT` environment variable:

    $ PORT=4321 python app.py
