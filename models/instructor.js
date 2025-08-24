'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Instructor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Instructor.belongsTo(models.User, { foreignKey: 'UserId' });
      Instructor.hasMany(models.Course, { foreignKey: 'InstructorId' });
    }
  }
  Instructor.init(
    {
      UserId: DataTypes.INTEGER,
      work_years: DataTypes.INTEGER,
      salary: DataTypes.INTEGER,
      join_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Instructor',
    }
  );
  return Instructor;
};
