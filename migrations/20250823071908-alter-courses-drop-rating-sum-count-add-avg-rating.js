'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Courses', 'avg_rating', { type: Sequelize.DECIMAL });
    await queryInterface.removeColumn('Courses', 'rating_sum');
    await queryInterface.removeColumn('Courses', 'rating_count');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Courses', 'rating_sum', { type: Sequelize.DECIMAL });
    await queryInterface.addColumn('Courses', 'rating_count', { type: Sequelize.INTEGER });
    await queryInterface.removeColumn('Courses', 'avg_rating');
  },
};
