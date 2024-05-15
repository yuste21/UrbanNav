import db from '../db.js'
import { DataTypes, FLOAT } from 'sequelize'

const Calificacion_MultaModel = db.define('calificaciones', {
    calificacion_multa: { type: DataTypes.ENUM('LEVE', 'GRAVE', 'MUY GRAVE') }
})

export const MultaModel = db.define('multas', {
    lat: { type: DataTypes.FLOAT },
    lon: { type: DataTypes.FLOAT },
    mes: { type: DataTypes.INTEGER },
    año: { type: DataTypes.INTEGER },
    hora: { type: DataTypes.TIME },
    coste: { type: DataTypes.DOUBLE },
    puntos: { type: DataTypes.INTEGER },
    denunciante: { type: DataTypes.STRING },
    infraccion: { type: DataTypes.STRING },
    vel_limite: { 
        type: DataTypes.INTEGER,
        allowNull: true
    },
    vel_circula: { 
        type: DataTypes.INTEGER,
        allowNull: true
    },
    multaId: { type: DataTypes.STRING }
})

//-----------------------------------------------------------------------

Calificacion_MultaModel.hasMany(MultaModel, {
    foreignKey: 'calificacionMultaId',
    as: 'calificacion_multas'
})

MultaModel.belongsTo(Calificacion_MultaModel, {
    foreignKey: 'calificacionMultaId'
})
