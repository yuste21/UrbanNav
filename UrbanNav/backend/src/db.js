import { Sequelize } from "sequelize";

const db = new Sequelize('urban_nav', 'root', 'alvaro21112002', {
    host: 'localhost',
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout: 480000, // 8 minutos de espera 
    },
    pool: {
        max: 50, // Numero máximo de conexiones simultaneas a la bd
    }
})

export default db