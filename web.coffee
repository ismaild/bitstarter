express = require 'express'
fs = require 'fs'

app = express.createServer express.logger() 

app.get '/', (request, response) ->
  response.send readStaticPage('index.html')

port = process.env.PORT or 5000

readStaticPage = (file) ->
  file = 'static_pages/' + file
  fs.readFileSync(file, 'utf8')

app.listen port, ->
  console.log "Listening on #{port}"
