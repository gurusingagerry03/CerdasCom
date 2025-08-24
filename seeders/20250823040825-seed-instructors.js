'use strict';

const fs = require('fs').promises;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = JSON.parse(await fs.readFile('./data/instructors.json', 'utf8')).map((e) => {
      delete e.id;
      e.createdAt = e.updatedAt = new Date();
      return e;
    });

    await queryInterface.bulkInsert('Instructors', data);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Instructors', null, {});
  },
};
