const express = require('express');
const Controller = require('./controllers/controller');
const { isLoggedIn, injectUser } = require('./middlewares/auth');
const app = express();
const session = require('express-session');
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
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.use(injectUser);

app.get('/', Controller.home);
app.get('/course', Controller.course);
app.get('/course/:id', Controller.courseDetail);
app.get('/category', Controller.category);
app.get('/login', Controller.getLogin);
app.post('/login', Controller.postLogin);
app.get('/register', Controller.getRegister);
app.post('/register', Controller.postRegister);
app.get('/logout', Controller.logout);
app.get('/myCourse/:userId', Controller.getCourseUser); // jangan lupa midlleware
app.get('/myCourse/review/:enrollmentId', Controller.getReview); // jangan lupa midlleware

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
