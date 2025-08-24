'use strict';
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = JSON.parse(await fs.readFile('./data/users.json', 'utf8')).map((e) => {
      delete e.id;
      const salt = bcrypt.genSaltSync(10);
      e.password = bcrypt.hashSync(e.password, salt);
      e.createdAt = e.updatedAt = new Date();
      return e;
    });
    await queryInterface.bulkInsert('Users', data);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null);
  },
};
