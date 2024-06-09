import db from '../db.js'
import { DataTypes } from 'sequelize' 
import { MultaModel } from './MultaModel.js'

export const RadarModel = db.define('radares', {
    lat: { type: DataTypes.FLOAT },
    lon: { type: DataTypes.FLOAT },
    sentido: { type: DataTypes.STRING },
    tipo: { type: DataTypes.STRING },
    numero: { type: DataTypes.INTEGER },
    ubicacion: { type: DataTypes.STRING },
    pk: { type: DataTypes.STRING }
})

RadarModel.hasMany(MultaModel, {
    foreignKey: {
        name: 'radarId',
        allowNull: true
    },
    as: 'multas'
})

MultaModel.belongsTo(RadarModel, {
    foreignKey: {
        name: 'radarId',
        allowNull: true
    }
})

export default RadarModel