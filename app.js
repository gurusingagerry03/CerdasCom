const express = require('express');
const Controller = require('./controllers/controller');
const { isLoggedIn, injectUser, isAdmin } = require('./middlewares/auth');
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
app.get('/course/:courseId', Controller.courseDetail);
app.get('/category', Controller.category);
app.get('/login', Controller.getLogin);
app.post('/login', Controller.postLogin);
app.get('/register', Controller.getRegister);
app.post('/register', Controller.postRegister);
app.get('/logout', Controller.logout);
// student
app.get('/myCourse/myLesson/:enrollmentId', Controller.getCourseLesson); // jangan lupa midlleware
app.get('/myCourse/:userId', Controller.getCourseUser); // jangan lupa midlleware
app.get('/enrollment/:userId/:courseId', Controller.getEnroll); // jangan lupa midlleware
app.get('/myCourse/review/:enrollmentId', Controller.getReview); // jangan lupa midlleware
app.post('/myCourse/review/:enrollmentId', Controller.postReview); // jangan lupa midlleware
app.post('/myCourse/review/:enrollmentId/edit', Controller.postEditReview); // jangan lupa midlleware
app.get('/myCourse/review/:enrollmentId/delete', Controller.getDeleteReview); // jangan lupa midlleware
app.get('/myCourse/myLesson/finish/:lessonProgressId', Controller.getFinishCourse); // jangan lupa midlleware
//admin
app.get('/admin', isLoggedIn, isAdmin, Controller.admin);
app.get('/admin/reports', Controller.reports);
app.get('/admin/users/:id/demote', Controller.demote);
app.get('/admin/users/:id/promote', Controller.promote);
app.get('/admin/instructors/:id/edit', Controller.getEditInstructor);
app.post('/admin/instructors/:id/edit', Controller.postEditInstructor);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
