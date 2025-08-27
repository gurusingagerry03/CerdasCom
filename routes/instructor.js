const express = require('express');
const Controller = require('../controllers/controller');
const { isLoggedIn, isInstructor } = require('../middlewares/auth');
const { upload, uploadFile } = require('../utils/upload');

const router = express.Router();

router.get('/instructor', isLoggedIn, isInstructor, Controller.instructor);
router.get('/instructor/courseList', isLoggedIn, isInstructor, Controller.listCourse);
router.get('/instructor/lessonList/:id', isLoggedIn, isInstructor, Controller.listLesson);
router.get('/instructor/addCourse', isLoggedIn, isInstructor, Controller.addCourse);
router.post(
  '/instructor/addCourse',
  isLoggedIn,
  isInstructor,
  upload.single('image_file'),
  Controller.postCourse
);

router.get('/instructor/editCourse/:id', isLoggedIn, isInstructor, Controller.editCourse);
router.post(
  '/instructor/editCourse/:id',
  isLoggedIn,
  isInstructor,
  upload.single('image_file'),
  Controller.editPostCourse
);
router.get('/lesson/add/:id', isLoggedIn, isInstructor, Controller.addLesson);
router.post(
  '/lesson/add/:id',
  isLoggedIn,
  isInstructor,
  uploadFile.single('link_materi'),
  Controller.postLesson
);
router.get('/lesson/edit/:id', isLoggedIn, isInstructor, Controller.editLesson);
router.post(
  '/lesson/edit/:id',
  isLoggedIn,
  isInstructor,
  uploadFile.single('link_materi'),
  Controller.postEditLesson
);
router.get('/course/:id/delete', isLoggedIn, isInstructor, Controller.deleteCourse);
router.get('/lesson/delete/:id', isLoggedIn, isInstructor, Controller.deleteLesson);

module.exports = router;
