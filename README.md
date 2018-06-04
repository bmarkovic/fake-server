Fake Server
===========

2018 Bojan Markovic  
bmarkovic.79@gmail.com

This is a simple web service written in **Node/Express**
that generates random JSON objects, and occasionally
(statistics are chosen PRNG randomly) responds with
a redirect or an error (4xx or 5xx).

The default statisical probabilities for different families
of responses are given:

|Type    |Percentage  |
|--------|------------|
|2xx     |75%         |
|3xx     |15%         |
|4xx     |10%         |
|5xx     |5%          |

So that, in practice, about 3/4ths of all requests respond
with a randomly generated JSON payload.

Installation
------------

Install the dependencies with `npm`:

    $ npm install

or `yarn`:

    $ yarn

Then simply run the application:

    $ npm run serve

or

    $ node .

By default it listens on 9900, but you can supply the port
with the `PORT` environment variable:

    $ PORT=9922 node .

And get more verbose output with:

    $ DEBUG=1 node .

Configuration
-------------

Default configuration is in the JS code, as:

```javascript
global.defaultConfig = {
  port: 9900,
  perc300: 15,
  perc400: 10,
  perc500: 5
}
```

This can be overridden with a `config.json` file
(or any JSON file given as an argument to the CLI
invocation)

    $ node . my-config.json

The JSON equivalent of the above would be:

```javascript
{
  "port": 9900,
  "perc300": 15,
  "perc400": 10,
  "perc500": 5
}
```

Stats
------

A special API endpoint `/stats` i.e:

http://localhost:9900/stats

Will return a `text/plain` response like this:

```
Response statistics
-------------------

Total requests: 40

Responses by type:
2xx: 72.50%
3xx: 12.50%
4xx: 12.50%
5xx: 2.50%
```
