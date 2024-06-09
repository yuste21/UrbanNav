import { Sequelize } from "sequelize";
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

// const db = new Sequelize('urban_nav', 'root', 'root', {
//     host: 'localhost',
//     dialect: 'mysql',
//     dialectOptions: {
//         connectTimeout: 480000, // 8 minutos de espera 
//     },
//     pool: {
//         max: 20, // Numero máximo de conexiones simultaneas a la bd
//         min: 0,
//         acquire: 30000,
//         idle: 20000,
//         acquireTimeout: 60000 // Aumenta el tiempo de espera de la adquisición de conexión
//     },
//     logging: console.log
// })

const db = new Sequelize(`${process.env.DB_CONNECTION}`, {
    host: `${process.env.DB_HOST}`,
    port: '3306',
    username: `${process.env.DB_USER}`,
    password: `${process.env.DB_PASSWORD}`,
    database: `${process.env.DB_NAME}`,
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout: 480000, // 8 minutos de espera 
    },
    pool: {
        max: 20, // Numero máximo de conexiones simultaneas a la bd
        min: 0,
        acquire: 30000,
        idle: 20000,
        acquireTimeout: 60000 // Aumenta el tiempo de espera de la adquisición de conexión
    },
    logging: console.log
})


export default db