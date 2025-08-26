'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    static totalRatingPerStar(objRating) {
      let counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let total = 0;
      for (const e of objRating) {
        const r = e.Review.rating;
        if (r >= 1 && r <= 5) {
          counts[r]++;
          total++;
        }
      }

      if (total) {
        for (let i = 1; i <= 5; i++) {
          counts[i] = (counts[i] / total) * 100;
        }
      }

      return counts;
    }
    static associate(models) {
      Enrollment.belongsToMany(models.Lesson, {
        through: models.LessonProgress,
        foreignKey: 'EnrollmentId',
      });
      Enrollment.hasOne(models.Review, { foreignKey: 'EnrollmentId' });
      Enrollment.belongsTo(models.User, { foreignKey: 'UserId' });
      Enrollment.belongsTo(models.Course, { foreignKey: 'CourseId' });
    }
  }
  Enrollment.init(
    {
      UserId: DataTypes.INTEGER,
      CourseId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      last_activity_at: DataTypes.DATE,
      completed_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Enrollment',
    }
  );

  Enrollment.afterCreate(async (enrollment) => {
    try {
      const { Lesson, LessonProgress, Course } = sequelize.models;

      const lessons = await Lesson.findAll({
        where: { CourseId: enrollment.CourseId },
      });

      if (!lessons.length) return;

      let course = await Course.findByPk(enrollment.CourseId);
      await course.update({
        students_count: course.students_count + 1,
      });
      const now = new Date();
      const rows = lessons.map((e) => ({
        EnrollmentId: enrollment.id,
        LessonId: e.id,
        isCompleted: false,
        completed_at: null,
        createdAt: now,
        updatedAt: now,
      }));

      await LessonProgress.bulkCreate(rows);
    } catch (error) {
      throw error;
    }
  });
  return Enrollment;
};
