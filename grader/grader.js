#!/usr/bin/env node

(function() {
  var CHECKSFILE_DEFAULT, HTMLFILE_DEFAULT, assertFileExists, assertURL, checkHtmlFile, cheerio, cheerioHtmlFile, clone, fs, htmlFromFile, htmlFromUrl, loadChecks, program, rest;

  fs = require('fs');

  program = require('commander');

  cheerio = require('cheerio');

  rest = require('restler');

  HTMLFILE_DEFAULT = "index.html";

  CHECKSFILE_DEFAULT = "checks.json";

  assertFileExists = function(infile) {
    var instr;
    instr = infile.toString();
    if (!fs.existsSync(instr)) {
      console.log("" + instr + " does not exist. Exiting");
      process.exit(1);
    }
    return instr;
  };

  assertURL = function(url) {
    var expression, regex;
    expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    regex = new RegExp(expression);
    if (!url.match(regex)) {
      console.log("" + url + " does not look like a url, enter a valid url");
      process.exit(1);
    }
    return url;
  };

  cheerioHtmlFile = function(html) {
    return cheerio.load(html);
  };

  loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
  };

  checkHtmlFile = function(html, checksfile) {
    var $, checks, ii, out, outJson, present;
    $ = cheerioHtmlFile(html);
    checks = loadChecks(checksfile).sort();
    out = {};
    for (ii in checks) {
      present = $(checks[ii]).length > 0;
      out[checks[ii]] = present;
    }
    outJson = JSON.stringify(out, null, 4);
    return console.log(outJson);
  };

  htmlFromFile = function(htmlfile, checksfile) {
    return fs.readFile(htmlfile, function(err, html) {
      return checkHtmlFile(html, checksfile);
    });
  };

  htmlFromUrl = function(url, checksfile) {
    return rest.get(url).on('complete', function(result, response) {
      return checkHtmlFile(result, checksfile);
    });
  };

  clone = function(fn) {
    return fn.bind({});
  };

  if (require.main === module) {
    program.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT).option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT).option('-u, --url <url_file>', 'Full url to check', clone(assertURL)).parse(process.argv);
    if (program.url) {
      htmlFromUrl(program.url, program.checks);
    } else {
      htmlFromFile(program.file, program.checks);
    }
  } else {
    exports.checkHtmlFile = checkHtmlFile;
  }

}).call(this);
