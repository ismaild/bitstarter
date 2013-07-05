fs = require 'fs'
program = require 'commander'
cheerio = require 'cheerio'
rest = require 'restler'
HTMLFILE_DEFAULT = "index.html"
CHECKSFILE_DEFAULT = "checks.json"

assertFileExists = (infile) ->
  instr = infile.toString()
  unless fs.existsSync(instr)
    console.log("#{instr} does not exist. Exiting")
    process.exit 1
  instr

assertURL = (url) ->
  expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  regex = new RegExp(expression)
  unless url.match(regex)
    console.log("#{url} does not look like a url, enter a valid url")
    process.exit 1
  url

cheerioHtmlFile = (html) ->
  cheerio.load html

loadChecks = (checksfile) ->
  JSON.parse fs.readFileSync(checksfile)

checkHtmlFile = (html, checksfile) ->
  $ = cheerioHtmlFile(html)
  checks = loadChecks(checksfile).sort()
  out = {}
  for ii of checks
    present = $(checks[ii]).length > 0
    out[checks[ii]] = present
  outJson = JSON.stringify out, null, 4
  console.log outJson

htmlFromFile = (htmlfile, checksfile) ->
  fs.readFile htmlfile, (err, html) ->
    checkHtmlFile(html, checksfile)

htmlFromUrl = (url, checksfile) ->
  rest.get(url).on 'complete', (result, response) ->
    checkHtmlFile(result, checksfile)

clone = (fn) ->
  fn.bind {}

if require.main is module
  program \
  .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT) \
  .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT) \
  .option('-u, --url <url_file>', 'Full url to check', clone(assertURL)) \
  .parse(process.argv)
  if program.url
    htmlFromUrl program.url, program.checks
  else
    htmlFromFile program.file, program.checks
else
  exports.checkHtmlFile = checkHtmlFile