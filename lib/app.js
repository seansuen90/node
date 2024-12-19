const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');
const compression = require('compression');
const helmet = require("helmet");

const app = express();
const RateLimit = require("express-rate-limit");
app.use(compression());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);
const limiter = RateLimit({
  windowsMs: 1 * 60 * 1000,
  max: 20,
});
app.set("trust proxy", 1);
app.use(limiter);



const mongoose = require('mongoose');
const { mainModule } = require('process');
mongoose.set("strictQuery", false);
const dev_db_url = "mongodb+srv://cooluser:626390@cluster0.10oq4.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0";

const mongoDB = process.env.MONGODB_URL || dev_db_url;
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

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
