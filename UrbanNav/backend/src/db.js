import { Sequelize } from "sequelize";

const db = new Sequelize('urban_nav', 'root', 'root', {
    host: 'localhost',
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

// const db = new Sequelize('mysql://root:kmxvguKuMpYFExCFRNfymzvWWIjIiBwm@roundhouse.proxy.rlwy.net:45205/railway', {
//     host: 'roundhouse.proxy.rlwy.net',
//     dialect: 'mysql',
//     dialectOptions: {
//         connectTimeout: 480000, // 8 minutos de espera 
//     },
//     pool: {
//         max: 90, // Numero máximo de conexiones simultaneas a la bd
//         acquire: 30000,
//         idle: 20000,
//         acquireTimeout: 60000 // Aumenta el tiempo de espera de la adquisición de conexión
//     },
//     logging: console.log
// })


export default db