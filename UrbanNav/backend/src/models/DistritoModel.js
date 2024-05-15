import db from "../db.js";
import { DataTypes } from 'sequelize'
import { AccidenteModel } from "./AccidenteModel.js"
import EstacionamientoModel from "./EstacionamientoModel.js";
import { TraficoModel } from "./TraficoModel.js";
import RadarModel from "./RadarModel.js";
import { MultaModel } from "./MultaModel.js";

export const DistritoModel = db.define('distritos', {
    codigo: { type: DataTypes.INTEGER },
    nombre: { type: DataTypes.STRING },
    delimitaciones: { type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER)) }
})

export const BarrioModel = db.define('barrios', {
    nombre: { type: DataTypes.STRING },
    delimitaciones: { type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER)) }
})

MultaModel.belongsTo(BarrioModel, {
    foreignKey: 'barrioId'
})
BarrioModel.hasMany(MultaModel, {
    foreignKey: 'barrioId',
    as: 'multas'
})

RadarModel.belongsTo(BarrioModel, {
    foreignKey: 'barrioId',
})
BarrioModel.hasMany(RadarModel, {
    foreignKey: 'barrioId',
    as: 'radares'
})

AccidenteModel.belongsTo(BarrioModel, {
    foreignKey: 'barrioId'
})
BarrioModel.hasMany(AccidenteModel, {
    foreignKey: 'barrioId',
    as: 'accidentes'
})

EstacionamientoModel.belongsTo(BarrioModel, {
    foreignKey: 'barrioId'
})
BarrioModel.hasMany(EstacionamientoModel, {
    foreignKey: 'barrioId',
    as: 'estacionamientos'
})

TraficoModel.belongsTo(BarrioModel ,{
    foreignKey: 'barrioId'
})
BarrioModel.hasMany(TraficoModel, {
    foreignKey: 'barrioId',
    as: 'aforos'
})

DistritoModel.hasMany(BarrioModel, {
    foreignKey: 'distritoId', // Nombre de la clave foránea en la tabla Barrios
    as: 'barrios' // Alias para acceder a la lista de barrios desde un objeto Distrito
});

BarrioModel.belongsTo(DistritoModel, {
    foreignKey: 'distritoId',
});

