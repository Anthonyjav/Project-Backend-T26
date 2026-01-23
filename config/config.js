require('dotenv').config();

module.exports = {
  development: {
    username: 'base_gkwa_user',
    password: 'dfrzZENRP6uFTP4nNq8qVuVnkiJKnpDO',
    database: 'base_gkwa',
    host: 'dpg-d4tno1adbo4c73aesf60-a.oregon-postgres.render.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
