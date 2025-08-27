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

      section_title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'st:section title required',
          },
          notNull: {
            msg: 'st:section title required',
          },
        },
      },

      section_order: DataTypes.INTEGER,

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

      video_url: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'video:video url required',
          },
          notNull: {
            msg: 'video:video url required',
          },
        },
      },

      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'duration:duration required',
          },
          notNull: {
            msg: 'duration:duration required',
          },
          min: {
            args: 1,
            msg: `duration:duration minimum 1`,
          },
        },
      },
      link_materi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Lesson',
    }
  );

  Lesson.beforeCreate(async (instance) => {
    let allLesson = await Lesson.findAll({
      where: { CourseId: instance.CourseId },
      order: [['section_order', 'ASC']],
    });

    if (allLesson.length > 0) {
      instance.section_order = allLesson[allLesson.length - 1].section_order + 1;
    } else {
      instance.section_order = 1;
    }
  });

  Lesson.afterCreate(async (lesson) => {
    const { Enrollment, LessonProgress, Course } = sequelize.models;
    let course = await Course.findByPk(lesson.CourseId);

    await course.update({
      total_duration_minutes: course.total_duration_minutes + lesson.duration,
    });
    const enrollments = await Enrollment.findAll({
      where: { CourseId: lesson.CourseId },
    });
    if (!enrollments.length) return;

    await Enrollment.update(
      {
        status: 'active',
        completed_at: null,
      },
      {
        where: { CourseId: lesson.CourseId },
      }
    );

    const now = new Date();
    const rows = enrollments.map((e) => ({
      EnrollmentId: e.id,
      LessonId: lesson.id,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    }));
    await LessonProgress.bulkCreate(rows, { ignoreDuplicates: true });
  });
  return Lesson;
};
