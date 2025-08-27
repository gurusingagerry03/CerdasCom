const express = require('express');
const session = require('express-session');
const path = require('path');
const { injectUser } = require('./middlewares/auth');
const router = require('./routes');

const app = express();
const port = 3000;

app.use(
  session({
    secret: 'CerdasCom',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: true,
    },
  })
);
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(injectUser);

app.use('/', router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
