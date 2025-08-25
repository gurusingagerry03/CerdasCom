'use strict';
const fs = require('fs').promises;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = JSON.parse(await fs.readFile('./data/reviews.json', 'utf8')).map((e) => {
      delete e.id;
      return e;
    });
    await queryInterface.bulkInsert('Reviews', data);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews', null);
  },
};
