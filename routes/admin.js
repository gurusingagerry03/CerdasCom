const express = require('express');
const Controller = require('../controllers/controller');
const { isLoggedIn, isAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/admin', isLoggedIn, isAdmin, Controller.admin);
router.get('/admin/reports', isLoggedIn, isAdmin, Controller.reports);
router.get('/admin/users/:id/demote', isLoggedIn, isAdmin, Controller.demote);
router.get('/admin/users/:id/promote', isLoggedIn, isAdmin, Controller.promote);
router.get('/admin/instructors/:id/edit', isLoggedIn, isAdmin, Controller.getEditInstructor);
router.post('/admin/instructors/:id/edit', isLoggedIn, isAdmin, Controller.postEditInstructor);

module.exports = router;
