'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    get firstName() {
      return this.full_name.split(' ')[0];
    }
    static associate(models) {
      User.hasOne(models.Instructor, { foreignKey: 'UserId' });
      User.hasMany(models.Enrollment, { foreignKey: 'UserId' });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      full_name: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  User.beforeCreate((instance) => {
    const salt = bcrypt.genSaltSync(10);
    instance.password = bcrypt.hashSync(instance.password, salt);
    instance.role = 'student';
  });

  return User;
};
