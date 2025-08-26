const { Op, where } = require('sequelize');
const {
  formatPrice,
  formatDate,
  getPercent,
  toEmbedUrl,
  formatDateToInput,
  getError,
} = require('../helpers/helper');

const {
  Course,
  Enrollment,
  Lesson,
  Review,
  User,
  Category,
  Instructor,
  LessonProgress,
} = require('../models');
const bcrypt = require('bcryptjs');

class Controller {
  static async getLogin(req, res) {
    try {
      let { errors, msg } = req.query;
      const page = 'home';
      res.render('login', { page, errors, getError, msg });
    } catch (error) {
      res.send(error);
    }
  }

  static async postLogin(req, res) {
    try {
      const { email, password } = req.body;
      let user = await User.findOne({
        where: { email: email },
      });
      if (user) {
        const isValidPassword = bcrypt.compareSync(password, user.password);

        if (isValidPassword) {
          req.session.user = {
            id: user.id,
            role: user.role,
          };
          if (user.role === 'admin') {
            res.redirect(`/admin`);
          } else {
            res.redirect(`/myCourse/${user.id}`);
          }
        } else {
          throw {
            name: 'SequelizeValidationError',
            errors: [{ message: 'msg:email atau password salah ' }],
          };
        }
      } else {
        throw {
          name: 'SequelizeValidationError',
          errors: [{ message: 'msg:email atau password salah ' }],
        };
      }
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        error = error.errors.map((el) => el.message);
        res.redirect(`/login/?errors=${error}`);
      } else {
        res.send(error);
      }
    }
  }

  static async getRegister(req, res) {
    try {
      let { errors } = req.query;
      const page = 'home';
      res.render('register', { page, errors, getError });
    } catch (error) {
      res.send(error);
    }
  }

  static async postRegister(req, res) {
    try {
      let { full_name, email, password, username } = req.body;
      await User.create({ full_name, email, password, username });
      res.redirect('/login');
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        error = error.errors.map((el) => el.message);
        res.redirect(`/register/?errors=${error}`);
      } else if (error.name === 'SequelizeUniqueConstraintError') {
        error = error.errors.map((el) => el.message);
        res.redirect(`/register/?errors=${error}`);
      } else {
        res.send(error);
      }
    }
  }

  static async logout(req, res) {
    try {
      req.session.destroy((error) => {
        if (error) {
          throw error;
        } else {
          res.redirect('/');
        }
      });
    } catch (error) {
      res.send(error);
    }
  }

  static async home(req, res) {
    try {
      let { msg } = req.query;
      let page = 'home';
      let course = await Course.findAll({
        order: [['students_count', 'DESC']],
        where: {
          is_published: true,
        },
        limit: 4,
      });
      res.render('home', { page, course, formatPrice, msg });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async course(req, res) {
    try {
      let page = 'course';
      let { sort, search, category } = req.query;
      let course = await Course.filter(sort, search, category);
      res.render('course', { page, course, formatPrice, sort, search, category });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async category(req, res) {
    try {
      let page = 'category';
      let categories = await Category.findAll();
      res.render('category', { page, categories });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async courseDetail(req, res) {
    try {
      let page = 'course';
      let { courseId } = req.params;

      const userId = req.session.user?.id;

      let isEnrolled = null;
      if (userId) {
        isEnrolled = await Enrollment.findOne({
          where: { UserId: userId, CourseId: courseId },
        });
      }

      let course = await Course.findByPk(courseId, {
        include: [
          {
            model: Lesson,
            separate: true,
            order: [['section_order', 'ASC']],
          },
          {
            model: Instructor,
            include: User,
          },
        ],
      });

      let ratings = await Enrollment.findAll({
        include: [{ model: User }, { model: Review, required: true }],
        where: {
          CourseId: courseId,
        },
        order: [[{ model: Review }, 'updatedAt', 'DESC']],
      });

      const percentRating = Enrollment.totalRatingPerStar(ratings);

      let totalLesson = await Lesson.count({ where: { CourseId: courseId } });
      res.render('courseDetail', {
        page,
        course,
        totalLesson,
        formatPrice,
        ratings,
        percentRating,
        formatDate,
        isEnrolled,
      });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async getCourseUser(req, res) {
    try {
      let { msg } = req.query;
      let page = 'course';
      let { userId } = req.params;
      let enrollmentCompleate = await Enrollment.findAll({
        include: [
          {
            model: Course,
            where: {
              is_published: true,
            },
            include: [
              {
                model: Category,
                attributes: ['name'],
              },
              {
                model: Instructor,
                include: {
                  model: User,
                  attributes: ['full_name'],
                },
              },
            ],
          },
          {
            model: Lesson,
          },
        ],
        where: {
          UserId: userId,
          completed_at: { [Op.not]: null },
        },
      });

      let enrollmentUnCompleate = await Enrollment.findAll({
        include: [
          {
            model: Course,
            where: {
              is_published: true,
            },
            include: [
              {
                model: Category,
                attributes: ['name'],
              },
              {
                model: Instructor,
                include: {
                  model: User,
                  attributes: ['full_name'],
                },
              },
              {
                model: Lesson,
              },
            ],
          },
          {
            model: Lesson,
            through: {
              where: { isCompleted: true },
            },
          },
        ],
        where: {
          UserId: userId,
          completed_at: { [Op.is]: null },
        },
      });

      res.render('myCourse', {
        page,
        enrollmentCompleate,
        enrollmentUnCompleate,
        formatDate,
        getPercent,
        msg,
      });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async getReview(req, res) {
    try {
      let { errors, msg } = req.query;
      let { enrollmentId } = req.params;
      let enrollment = await Enrollment.findByPk(enrollmentId);
      let review = await Review.findOne({
        where: {
          EnrollmentId: enrollmentId,
        },
      });
      let course = await Course.findByPk(enrollment.CourseId, {
        include: [
          {
            model: Instructor,
            include: User,
          },
          {
            model: Category,
          },
        ],
      });
      let reviews = await Enrollment.findAll({
        include: [{ model: User }, { model: Review, required: true }],
        where: {
          CourseId: enrollment.CourseId,
        },
        order: [[{ model: Review }, 'updatedAt', 'DESC']],
      });
      const percentRating = Enrollment.totalRatingPerStar(reviews);
      res.render('review', {
        reviews,
        course,
        percentRating,
        formatDate,
        enrollmentId,
        review,
        errors,
        getError,
        msg,
      });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async postReview(req, res) {
    try {
      const { enrollmentId } = req.params;
      const { rating, comment } = req.body;
      await Review.create({
        rating,
        comment,
        EnrollmentId: enrollmentId,
      });
      const msg = 'review added';
      res.redirect(`/myCourse/review/${enrollmentId}/?msg=${msg}`);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const { enrollmentId } = req.params;
        error = error.errors.map((el) => el.message);
        res.redirect(`/myCourse/review/${enrollmentId}/?errors=${error}`);
      } else {
        res.send(error);
      }
    }
  }

  static async postEditReview(req, res) {
    try {
      const { enrollmentId } = req.params;
      const { rating, comment } = req.body;
      const review = await Review.findOne({
        where: {
          EnrollmentId: enrollmentId,
        },
      });

      await review.update({
        rating,
        comment,
      });

      const msg = 'review updated';
      res.redirect(`/myCourse/review/${enrollmentId}/?msg=${msg}`);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async getDeleteReview(req, res) {
    try {
      const { enrollmentId } = req.params;
      const review = await Review.findOne({
        where: {
          EnrollmentId: enrollmentId,
        },
      });

      await review.destroy();

      const msg = 'review berhasil dihapus';
      res.redirect(`/myCourse/review/${enrollmentId}/?msg=${msg}`);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async getEnroll(req, res) {
    try {
      let { userId, courseId } = req.params;
      let course = await Course.findByPk(courseId);
      await Enrollment.create({
        UserId: userId,
        CourseId: courseId,
        status: 'active',
        last_activity_at: new Date(),
        completed_at: null,
      });
      let msg = `${course.title} added`;
      res.redirect(`/myCourse/${userId}/?msg=${encodeURIComponent(msg)}`);
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async getCourseLesson(req, res) {
    try {
      let { enrollmentId } = req.params;
      const enrol = await Enrollment.findByPk(enrollmentId, {
        include: [
          {
            model: Lesson,
          },
        ],
        order: [[Lesson, 'section_order', 'ASC']],
      });
      let course = await Course.findByPk(enrol.CourseId);
      if (enrol.status === 'completed') {
        const msg = `Your Compleated Course ${course.title} `;
        res.redirect(`/myCourse/${enrol.UserId}/?msg=${msg}`);
      }
      let firstIncomplete = await enrol.getLessons({
        through: { where: { isCompleted: false } },
        order: [['section_order', 'ASC']],
        limit: 1,
      });
      firstIncomplete = firstIncomplete[0];
      const totalCompleate = await enrol.countLessons({
        through: { where: { isCompleted: true } },
      });

      res.render(`courseLesson`, {
        course,
        enrol,
        getPercent,
        totalCompleate,
        firstIncomplete,
        formatDate,
        toEmbedUrl,
      });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async getFinishCourse(req, res) {
    try {
      let { lessonProgressId } = req.params;
      const findLP = await LessonProgress.findByPk(lessonProgressId);
      await findLP.update({
        isCompleted: true,
      });
      res.redirect(`/myCourse/myLesson/${findLP.EnrollmentId}`);
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async admin(req, res) {
    try {
      const { msg } = req.query;
      const page = 'home';
      let users = await User.findAll({
        include: Instructor,
        where: {
          role: { [Op.ne]: 'admin' },
        },
      });
      let instructors = await Instructor.findAll({
        include: User,
      });
      let totalInstructors = await User.count({ where: { role: 'instructor' } });
      res.render(`admin`, {
        page,
        users,
        totalInstructors,
        instructors,
        formatDate,
        formatPrice,
        msg,
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async promote(req, res) {
    try {
      const { id } = req.params;
      let user = await User.findByPk(id);
      await user.update({
        role: 'instructor',
      });
      await Instructor.create({
        UserId: id,
        salary: 0,
        join_date: new Date(),
      });
      const msg = `${user.full_name} Promoted`;
      res.redirect(`/admin/?msg=${msg}`);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async demote(req, res) {
    try {
      const { id } = req.params;
      let user = await User.findByPk(id);
      await user.update({
        role: 'student',
      });

      let instructor = await Instructor.findOne({
        where: {
          UserId: id,
        },
      });
      await instructor.destroy();

      const msg = `${user.full_name} Demoted`;
      res.redirect(`/admin/?msg=${msg}`);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async reports(req, res) {
    try {
      let courses = await Course.findAll({
        order: [['title', 'ASC']],
        raw: true,
      });

      let revLabels = courses.map((elm) => elm.title);
      let revValues = courses.map((elm) => Number(elm.price) * Number(elm.students_count || 0));

      let topCourses = await Course.findAll({
        order: [['students_count', 'DESC']],
        limit: 5,
        raw: true,
      });

      let topLabels = topCourses.map((elm) => elm.title);
      let topValues = topCourses.map((elm) => Number(elm.students_count || 0));

      res.render('reports', {
        page: 'reports',
        revLabels,
        revValues,
        topLabels,
        topValues,
      });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async getEditInstructor(req, res) {
    try {
      let { errors } = req.query;
      const page = 'home';
      let { id } = req.params;
      const instructor = await Instructor.findByPk(id, {
        include: User,
      });
      res.render(`editInstructor`, { page, formatDateToInput, instructor, errors, getError });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postEditInstructor(req, res) {
    try {
      const page = 'home';
      let { id } = req.params;
      const instructor = await Instructor.findByPk(id, {
        include: User,
      });
      await instructor.update(req.body);

      const msg = `${instructor.User.full_name} updated`;
      res.redirect(`/admin/?msg=${msg}`);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        error = error.errors.map((el) => el.message);
        let { id } = req.params;
        res.redirect(`/admin/instructors/${id}/edit/?errors=${error}`);
      } else {
        res.send(error);
      }
    }
  }
}

module.exports = Controller;
