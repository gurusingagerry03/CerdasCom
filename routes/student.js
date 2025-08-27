const express = require('express');
const Controller = require('../controllers/controller');
const { isLoggedIn } = require('../middlewares/auth');

const router = express.Router();
router.get('/myCourse/myLesson/:enrollmentId', isLoggedIn, Controller.getCourseLesson);
router.get('/myCourse/:userId', isLoggedIn, Controller.getCourseUser);
router.get('/enrollment/:userId/:courseId', isLoggedIn, Controller.getEnroll);
router.get('/myCourse/review/:enrollmentId', isLoggedIn, Controller.getReview);
router.post('/myCourse/review/:enrollmentId', isLoggedIn, Controller.postReview);
router.post('/myCourse/review/:enrollmentId/edit', isLoggedIn, Controller.postEditReview);
router.get('/myCourse/review/:enrollmentId/delete', isLoggedIn, Controller.getDeleteReview);
router.get('/myCourse/myLesson/finish/:lessonProgressId', isLoggedIn, Controller.getFinishCourse);

module.exports = router;
