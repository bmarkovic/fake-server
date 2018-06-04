const express = require('express')
const http = require('http')
const faker = require('faker')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')

/* eslint-disable no-undef */
let web = express()
let server = http.createServer(web)

const debug = process.env.DEBUG
  ? console.debug.bind(console)
  : Function.prototype // javascript for 'noop'

// DEFAULT CONFIGURATION
global.defaultConfig = {
  port: 9900,
  perc300: 15,
  perc400: 10,
  perc500: 5
}

global.envOverRides = {
  port: process.env.PORT || undefined
}

// load config filie and merge configurations
function getConfig() {
  let arg = process.argv[2]

  if (arg && !arg.endsWith('json')) {
    console.error(
      'ERROR: Supplied argument is not a JSON file. ' +
      'Continuing with default config file.'
    )
    arg = 'config.json'
  }

  let name = arg || 'config.json'
  let found = false
  let files = []
  let userConfig = {}

  const paths = [ './', '../', '' ]
  paths.forEach(pathlet => {
    files.push( path.resolve(pathlet, name) )
  })

  files.forEach(file => {
    if (!found && fs.existsSync(file)) {
      userConfig = require(file)
      if ((userConfig instanceof Object) && (Object.keys(userConfig).length > 0)) {
        debug(`Using configuration from file ${file}`)
        found = true
      } else {
        userConfig = {}
      }
    }
  })

  if (!found) {
    debug(
      `File ${name} is not a proper config file. ` +
      'Continuing with default config.'
    )
  }

  let config = _.merge(global.defaultConfig, userConfig, global.envOverRides)
  config.perc200 = 100 - (config.perc300 + config.perc400 + config.perc500)
  return config
}

// stats globals
global.numReq = 0
global.reqs = {
    200: 0,
    300: 0,
    400: 0,
    500: 0
}

// non-200 response texts
global.respTable = {
  302: 'Found',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
  501: 'Not Implemented'
}

// supported 40x errors
global.errors400 = [0, 1, 3, 4]

global.config = getConfig()

// setup morgan for logging
const formatter = (tokens, req, res) => {
  return [
    '[', tokens.date(req, res, 'clf'), ']',
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), 'bytes -',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}

// fake json generator
const genData = path => {
  let data = faker.helpers.userCard()
  data['path'] = path
  return data
}

// calculate and return stats
const stats = (req, res) => {
  reqs[200] += 1
  let str = 'Response statistics\n'
  str += '-------------------\n\n'

  str += `Total requests: ${numReq}\n\n`

  str += 'Responses by type:\n'
  str += `2xx: ${(100 * reqs[200] / numReq).toFixed(2)}%\n`
  str += `3xx: ${(100 * reqs[300] / numReq).toFixed(2)}%\n`
  str += `4xx: ${(100 * reqs[400] / numReq).toFixed(2)}%\n`
  str += `5xx: ${(100 * reqs[500] / numReq).toFixed(2)}%\n`

  res.send(str)
}
const defaultResponse = (config) => {

  let { perc200, perc300, perc400, perc500 } = config
  debug('Defining default responses with the following ratios:')
  debug(`
  200: ${perc200}%
  300: ${perc300}%
  400: ${perc400}%
  500: ${perc500}%
  `)

  return (req, res) => {

    numReq += 1
    if (req.path === '/stats') stats(req, res)
    else {
      let dice = _.random(1, 100)
      if (dice < perc200) {
        reqs[200] += 1
        res.send(genData(req.path.slice(1)))
      } else if (dice < perc200 + perc300) {
        reqs[300] += 1
        res.redirect(302, path.join(...faker.random.words().toLowerCase().split(' ')))
      } else if (dice < perc200 + perc300 + perc400) {
        reqs[400] += 1
        let status = 400 + faker.random.arrayElement(errors400)
        res.status(status).send(respTable[status])
      } else {
        reqs[500] += 1
        let status = _.random(500, 501, false)
        res.status(status).send(respTable[status])
      }
    }
  }
}

// inject morgan into express
if (process.env.DEBUG) web.use(require('morgan')(formatter, process.stdout))

// čdefault route handler
web.use(defaultResponse(config))

// lift server, start listening
server.listen(config.port, () => {
  console.log(`Listening on port ${config.port}`)
})
