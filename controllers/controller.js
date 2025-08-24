const { Op, where } = require('sequelize');
const { formatPrice, formatDate, getPercent } = require('../helpers/helper');
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
          res.redirect('/');
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
      let { id } = req.params;
      let course = await Course.findByPk(id, {
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
          CourseId: id,
        },
      });

      const percentRating = Enrollment.totalRatingPerStar(ratings);

      let totalLesson = await Lesson.count({ where: { CourseId: id } });
      res.render('courseDetail', {
        page,
        course,
        totalLesson,
        formatPrice,
        ratings,
        percentRating,
        formatDate,
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
      let page = 'course';
      res.render('review', { page });
    } catch (error) {
      console.log(error);

      res.send(error);
    }
  }
}

module.exports = Controller;
