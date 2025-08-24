'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LessonProgress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LessonProgress.init({
    EnrollmentId: DataTypes.INTEGER,
    LessonId: DataTypes.INTEGER,
    isCompleted: DataTypes.BOOLEAN,
    completed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'LessonProgress',
  });
  return LessonProgress;
};