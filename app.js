const path = require('path');
const express = require('express');
const morgan = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')
const PORT = process.env.PORT || 3000
const app = express();
const http = require('http').Server(app);

module.exports = app

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
// static file-serving middleware
app.use(express.static(path.join(__dirname, './public')))

app.use('/api', require('./routes'));

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})


// error handling endware
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).send(err.message || 'Internal server error.')
})

http.listen(PORT, function(){
  console.log('listening on *:3000');
});