import db from '../../db.js'
import { DataTypes } from 'sequelize' 

export const EstacionamientoModel = db.define('estacionamientos', {
    lat: { type: DataTypes.FLOAT },
    lon: { type: DataTypes.FLOAT },
    plazas: { type: DataTypes.INTEGER }
})

export const ColorModel = db.define('colores', {
    color: { type: DataTypes.ENUM('Verde', 'Azul', 'Naranja', 'Rojo', 'Negro', 'Morado', 'Amarillo') },
    significado: { type: DataTypes.ENUM(
        'Residencial',
        'Rotacional',
        'Larga distancia',
        'Ámbito sanitario',
        'Minusválidos',
        'Reserva motos',
        'Carga y descarga',
        'Alta rotación'
    ) }
})

export const Tipo_EstacionamientoModel = db.define('tipo_estacionamientos', {
    tipo_estacionamiento: { type: DataTypes.ENUM('Línea', 'Batería', 'Desconocido') }
})

ColorModel.hasMany(EstacionamientoModel, {
    foreignKey: 'coloreId',
    as: 'colores'
})
EstacionamientoModel.belongsTo(ColorModel, {
    foreignKey: 'coloreId'
})

//--------------------------------------------------------//

Tipo_EstacionamientoModel.hasMany(EstacionamientoModel, {
    foreignKey: 'tipoEstacionamientoId',
    as: 'tipo_estacionamientos'
})
EstacionamientoModel.belongsTo(Tipo_EstacionamientoModel, {
    foreignKey: 'tipoEstacionamientoId'
})

export default EstacionamientoModel