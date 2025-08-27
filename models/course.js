'use strict';
const { Model, Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    get time() {
      if (this.total_duration_minutes < 60) {
        return `${this.total_duration_minutes} minute`;
      }
      const h = Math.floor(this.total_duration_minutes / 60);
      const min = this.total_duration_minutes % 60;
      return `${h} Hours ${min} minute`;
    }

    static filter(sort, search, category) {
      const option = {
        where: {
          is_published: true,
        },
      };
      switch (sort) {
        case 'popular':
          option.order = [['students_count', 'DESC']];
          break;
        case 'price':
          option.order = [['price', 'ASC']];
          break;
        case 'rating':
          option.order = [['avg_rating', 'DESC']];
          break;
        default:
          option.order = [['students_count', 'DESC']];
          break;
      }
      if (category) {
        option.where.CategoryId = +category;
      }
      if (search) {
        option.where.title = { [Op.iLike]: `%${search}%` };
      }
      return Course.findAll(option);
    }

    static associate(models) {
      Course.belongsTo(models.Instructor, { foreignKey: 'InstructorId' });
      Course.hasMany(models.Enrollment, { foreignKey: 'CourseId' });
      Course.hasMany(models.Lesson);
      Course.belongsTo(models.Category);
    }
  }

  Course.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'title:title required',
          },
          notNull: {
            msg: 'title:title required',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'desc:description required',
          },
          notNull: {
            msg: 'desc:description required',
          },
        },
      },

      image: DataTypes.TEXT,

      level: DataTypes.STRING,

      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'price:price required',
          },
          notNull: {
            msg: 'price:price required',
          },
          min: {
            args: 10000,
            msg: 'price:price minimal 10000',
          },
        },
      },

      avg_rating: DataTypes.DECIMAL,
      total_duration_minutes: DataTypes.INTEGER,
      students_count: DataTypes.INTEGER,
      is_published: DataTypes.BOOLEAN,

      CategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'category:CategoryId required',
          },
          notNull: {
            msg: 'category:CategoryId required',
          },
        },
      },
      InstructorId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'Course',
    }
  );

  Course.beforeCreate((instance) => {
    instance.total_duration_minutes = 0;
    instance.students_count = 0;
    instance.avg_rating = 0;
    instance.is_published = false;
  });
  return Course;
};
