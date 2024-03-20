import db from '../db.js'
import { DataTypes } from 'sequelize' 

const RadarModel = db.define('radares', {
    lat: { type: DataTypes.FLOAT },
    lon: { type: DataTypes.FLOAT },
    sentido: { type: DataTypes.STRING },
    tipo: { type: DataTypes.STRING }
})

export default RadarModel