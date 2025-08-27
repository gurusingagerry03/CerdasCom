const express = require('express');
const Controller = require('../controllers/controller');

const router = express.Router();
router.get('/', Controller.home);
router.get('/course', Controller.course);
router.get('/course/:courseId', Controller.courseDetail);
router.get('/category', Controller.category);

router.get('/login', Controller.getLogin);
router.post('/login', Controller.postLogin);
router.get('/register', Controller.getRegister);
router.post('/register', Controller.postRegister);
router.get('/logout', Controller.logout);

module.exports = router;
