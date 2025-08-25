'use strict';
const { Model } = require('sequelize');
const { Hooks } = require('sequelize/lib/hooks');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Review.belongsTo(models.Enrollment, { foreignKey: 'EnrollmentId' });
    }

    static async recomputeCourseAvg(instance) {
      try {
        const { Enrollment, Course, Review } = sequelize.models;
        let enrol = await Enrollment.findByPk(instance.EnrollmentId);
        let filterenrol = await Enrollment.findAll({
          include: {
            model: Review,
            required: true,
          },
          where: {
            CourseId: enrol.CourseId,
          },
        });
        let totalReviewer = filterenrol.length;
        let totalRating = 0;
        filterenrol.forEach((e) => {
          totalRating = totalRating + e.Review.rating;
        });
        let avgRating = totalRating / totalReviewer;
        if (!avgRating) {
          avgRating = 0;
        } else {
          avgRating = avgRating.toFixed(1);
        }
        await Course.update({ avg_rating: avgRating }, { where: { id: enrol.CourseId } });
      } catch (error) {
        throw error;
      }
    }
  }

  Review.init(
    {
      EnrollmentId: DataTypes.INTEGER,
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Review',
    }
  );

  Review.afterCreate(async (review) => {
    await Review.recomputeCourseAvg(review);
  });

  Review.afterUpdate(async (review) => {
    await Review.recomputeCourseAvg(review);
  });

  Review.afterDestroy(async (review) => {
    await Review.recomputeCourseAvg(review);
  });

  return Review;
};
