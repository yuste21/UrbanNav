import db from '../db.js'
import { DataTypes } from 'sequelize' 

export const TraficoModel = db.define('aforos', {
    fecha: { type: DataTypes.DATEONLY },
    estacion: { type: DataTypes.INTEGER },
    lat: { type: DataTypes.FLOAT },
    lon: { type: DataTypes.FLOAT },
    nombre: { type: DataTypes.STRING },
    trafico: { type: DataTypes.ARRAY(DataTypes.INTEGER) }
})

export const OrientacionModel = db.define('orientaciones', {
    orientacion: { type: DataTypes.ENUM('Norte-Sur', 'Sur-Norte', 'Este-Oeste', 'Oeste-Este') }
})

OrientacionModel.hasMany(TraficoModel)
TraficoModel.belongsTo(OrientacionModel, {
    foreignKey: 'orientacioneId'
})