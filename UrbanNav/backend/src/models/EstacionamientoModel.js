import db from '../db.js'
import { DataTypes } from 'sequelize' 

const EstacionamientoModel = db.define('estacionamientos', {
    lat: { type: DataTypes.FLOAT },
    lon: { type: DataTypes.FLOAT },
    distrito: { type: DataTypes.STRING },
    barrio: { type: DataTypes.STRING },
    color: { type: DataTypes.STRING },
    tipo: { type: DataTypes.STRING },
    plazas: { type: DataTypes.INTEGER }
})

export default EstacionamientoModel