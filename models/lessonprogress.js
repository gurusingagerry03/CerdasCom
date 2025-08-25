'use strict';
const { Model } = require('sequelize');
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
  LessonProgress.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      EnrollmentId: DataTypes.INTEGER,
      LessonId: DataTypes.INTEGER,
      isCompleted: DataTypes.BOOLEAN,
      completed_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'LessonProgress',
    }
  );

  LessonProgress.beforeUpdate((el) => {
    if (el.isCompleted) {
      el.completed_at = new Date();
    }
  });

  LessonProgress.afterUpdate(async (el) => {
    const { Enrollment, LessonProgress } = el.sequelize.models;

    const total = await LessonProgress.count({
      where: { EnrollmentId: el.EnrollmentId },
    });

    const done = await LessonProgress.count({
      where: { EnrollmentId: el.EnrollmentId, isCompleted: true },
    });

    if (done === total) {
      await Enrollment.update(
        { status: 'completed', completed_at: new Date() },
        { where: { id: el.EnrollmentId } }
      );
    }
  });
  return LessonProgress;
};
