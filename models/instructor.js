'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Instructor extends Model {
    static associate(models) {
      Instructor.belongsTo(models.User, { foreignKey: 'UserId' });
      Instructor.hasMany(models.Course, { foreignKey: 'InstructorId' });
    }
  }
  Instructor.init(
    {
      UserId: DataTypes.INTEGER,
      work_years: DataTypes.INTEGER,
      salary: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'salary:Salary required',
          },
          notNull: {
            msg: 'salary:Salary required',
          },
          min: {
            args: [0],
            msg: 'salary:Salary cannot be negative',
          },
        },
      },
      join_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'join_date:Join date required',
          },
          notNull: {
            msg: 'join_date:Join date required',
          },
          isBeforeToday(value) {
            const today = new Date();
            if (new Date(value) > today) {
              throw new Error('join_date:Join date cannot be in the future');
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Instructor',
    }
  );

  Instructor.beforeSave((instance) => {
    instance.work_years = new Date().getFullYear() - new Date(instance.join_date).getFullYear();
  });

  Instructor.beforeDestroy(async (instructor) => {
    const { Course } = instructor.sequelize.models;

    await Course.update(
      { is_published: false, InstructorId: null },
      { where: { InstructorId: instructor.id } }
    );
  });
  return Instructor;
};
