const router = require('express').Router();

const publicRouter = require('./public');
const studentRouter = require('./student');
const adminRouter = require('./admin');
const instructorRouter = require('./instructor');

router.use('/', publicRouter);
router.use('/', studentRouter);
router.use('/', adminRouter);
router.use('/', instructorRouter);

module.exports = router;
