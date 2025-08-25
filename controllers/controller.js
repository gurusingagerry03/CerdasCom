const { Op, where } = require('sequelize');
const { formatPrice, formatDate, getPercent, toEmbedUrl } = require('../helpers/helper');
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
      const page = 'home';
      res.render('login', { page });
    } catch (error) {
      console.log(error);

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
          res.redirect(`/myCourse/${user.id}`);
        } else {
          throw {
            name: 'LoginValidationError',
            error: 'password salah.',
          };
        }
      } else {
        throw {
          name: 'LoginValidationError',
          error: 'email atau password salah ',
        };
      }
    } catch (error) {
      if (error.name === 'LoginValidationError') {
        res.redirect(`/login/?error=${error.error}`);
      } else {
        console.log(error);

        res.send(error);
      }
    }
  }

  static async getRegister(req, res) {
    try {
      const page = 'home';
      res.render('register', { page });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async postRegister(req, res) {
    try {
      let { full_name, email, password, username } = req.body;
      await User.create({ full_name, email, password, username });
      res.redirect('/login');
    } catch (error) {
      console.log(error);

      res.send(error);
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
      let page = 'home';
      let course = await Course.findAll({
        order: [['students_count', 'DESC']],
        limit: 4,
      });
      res.render('home', { page, course, formatPrice });
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
      let page = 'course';
      let { userId } = req.params;
      let enrollmentCompleate = await Enrollment.findAll({
        include: [
          {
            model: Course,
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
      });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }

  static async getReview(req, res) {
    try {
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
      res.redirect(`/myCourse/review/${enrollmentId}`);
    } catch (error) {
      console.log(error);
      res.send(error);
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

      res.redirect(`/myCourse/review/${enrollmentId}`);
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

      res.redirect(`/myCourse/review/${enrollmentId}`);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async getEnroll(req, res) {
    try {
      let { userId, courseId } = req.params;
      await Enrollment.create({
        UserId: userId,
        CourseId: courseId,
        status: 'active',
        last_activity_at: new Date(),
        completed_at: null,
      });

      res.redirect(`/myCourse/${userId}`);
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
      if (enrol.status === 'completed') {
        res.redirect(`/myCourse/${enrol.UserId}`);
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

      let course = await Course.findByPk(enrol.CourseId);

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
}

module.exports = Controller;
