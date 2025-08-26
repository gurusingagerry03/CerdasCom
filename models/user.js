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
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'username:username already taken',
        },
        validate: {
          notEmpty: {
            msg: 'username:userName required',
          },
          notNull: {
            msg: 'username:userName required',
          },
          len: {
            args: [1, 10],
            msg: 'username:username must be at most 10 characters',
          },
          isOneWord(value) {
            if (value.includes(' ')) {
              throw new Error('username:username must be one word (no spaces)');
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'email:Email already registered',
        },
        validate: {
          notEmpty: {
            msg: 'email:Email required',
          },
          notNull: {
            msg: 'email:Email required',
          },
          isEmail: {
            msg: 'email:Must be a valid email address',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'pass:password required',
          },
          notNull: {
            msg: 'pass:password required',
          },
          len: {
            args: [8],
            msg: 'pass:Password must be at least 8 characters',
          },
        },
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'fullname:full name required',
          },
          notNull: {
            msg: 'fullname:full name required',
          },
        },
      },
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
