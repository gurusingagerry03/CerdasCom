'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Lesson.belongsToMany(models.Enrollment, {
        through: models.LessonProgress,
        foreignKey: 'LessonId',
      });
      Lesson.belongsTo(models.Course);
    }
  }
  Lesson.init(
    {
      CourseId: DataTypes.INTEGER,
      section_title: DataTypes.STRING,
      section_order: DataTypes.INTEGER,
      title: DataTypes.STRING,
      video_url: DataTypes.TEXT,
      duration: DataTypes.INTEGER,
      link_materi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Lesson',
    }
  );
  return Lesson;
};
