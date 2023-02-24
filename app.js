const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const helmet = require('helmet');
const connection  = require('./lib/database');
const index=require('./routes/index');
const usersRouter = require('./routes/users');
const record = require('./routes/record');
const track = require('./routes/track');
const select = require('./routes/select');
const book = require('./routes/book');
const todo = require('./routes/todo');
const memo = require('./routes/memo');
const log4js = require('log4js');

const app = express();

app.use(helmet());
// view engine setup

var session_opt={
  secret:'keyboard cat',
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:60 * 30 * 1000}
};
app.use(session(session_opt));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index); 
app.use('/users', usersRouter); 
app.use('/record', record); 
app.use('/record/track', track); 
app.use('/select', select); 
app.use('/book', book); 
app.use('/todo', todo); 
app.use('/memo', memo);

log4js.configure('./src/config/log4js.config.json');
const systemLogger = log4js.getLogger('system'); 
const httpLogger = log4js.getLogger('http'); 
const accessLogger = log4js.getLogger('access');
app.use(log4js.connectLogger(accessLogger));
app.use((req, res, next) => {
  if (typeof req === 'undefined' || req === null ||
        typeof req.method === 'undefined' || req.method === null ||
        typeof req.header === 'undefined' || req.header === null) {
    next();
    return;
  }
  if (req.method === 'GET' || req.method === 'DELETE') {
    httpLogger.info(req.query);
  } else {
    httpLogger.info(req.body);
  }
  next();
});
systemLogger.info("App start");


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
