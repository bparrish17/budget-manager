const express = require('express');
const morgan = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')
const PORT = process.env.PORT || 3000
const app = express();
const http = require('http').Server(app);
require('./secrets')

/**
 * In your development environment, you can keep all of your
 * app's secret API keys in a file called `secrets.js`, in your project
 * root. This file is included in the .gitignore - it will NOT be tracked
 * or show up on Github. On your production server, you can add these
 * keys as environment variables, so that they can still be read by the
 * Node process on process.env
 */

app.use(morgan('dev'))

// body parsing middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// session middleware with passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'test',
  resave: false,
  saveUninitialized: false
}))

app.use((req, res, next) => {
  console.log('REQ SESSION', req.session)
  next();
})

// error handling endware
app.use((err, req, res, next) => {
  console.error(err)
  console.error(err.stack)
  res.status(err.status || 500).send(err.message || 'Internal server error.')
})

http.listen(PORT, function(){
  console.log('listening on *:3000');
});


module.exports = app