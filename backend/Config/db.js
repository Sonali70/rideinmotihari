const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ride_in_motihari_db', 'root', 'SONALI7050', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;