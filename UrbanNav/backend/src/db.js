import { Sequelize } from "sequelize";

const db = new Sequelize('urban_nav', 'root', 'alvaro21112002', {
    host: 'localhost',
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout: 120000, // 60 segundos (ajusta este valor según tus necesidades)
    },
    pool: {
        max: 150, // Ajusta este valor según tus necesidades
    }
})

export default db