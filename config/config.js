require('dotenv').config();

module.exports = {
  development: {
    username: 'back_2cx6_user',
    password: 'ddxxd24TpajAdDaJxa9ZUc6mfAyruSDC',
    database: 'back_2cx6',
    host: 'dpg-d6or9095pdvs73ask93g-a.oregon-postgres.render.com ',
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
