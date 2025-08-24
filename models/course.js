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
      const option = { where: {} };
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
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.TEXT,
      level: DataTypes.STRING,
      price: DataTypes.INTEGER,
      avg_rating: DataTypes.DECIMAL,
      total_duration_minutes: DataTypes.INTEGER,
      students_count: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Course',
    }
  );
  return Course;
};
