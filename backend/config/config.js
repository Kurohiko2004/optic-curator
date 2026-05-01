require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 22005,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
      connectTimeout: 60000 // Thêm timeout để tránh treo kết nối
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000, // Sequelize sẽ đóng kết nối nết idle quá 10s (Aiven tự đóng sau ~5p)
      evict: 10000
    },
    logging: false
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false, // Set to false for easier debugging with Aiven SSL
      },
      connectTimeout: 60000
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 10000,
      evict: 10000
    },
    logging: false
  }
};
