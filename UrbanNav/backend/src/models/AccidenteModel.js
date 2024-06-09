import db from '../../db.js';
import { DataTypes } from 'sequelize';

export const AccidenteModel = db.define('accidentes', {
    lat: { type: DataTypes.FLOAT },
    lon: { type: DataTypes.FLOAT },
    fecha: { type: DataTypes.DATEONLY },
    hora: { type: DataTypes.TIME },
    localizacion: { type: DataTypes.STRING },
    edad: { type: DataTypes.INTEGER },
    alcohol: { type: DataTypes.BOOLEAN },
    drogas: { type: DataTypes.BOOLEAN }
})

export const SexoModel = db.define('sexos', {
    sexo: { type: DataTypes.ENUM('Mujer', 'Hombre', 'Desconocido') }
})

export const Tipo_AccidenteModel = db.define('tipo_accidentes', {
    tipo_accidente: { type: DataTypes.ENUM(
        'Colisión doble',
        'Colisión múltiple',
        'Alcance',
        'Choque contra obstáculo fijo',
        'Atropello a persona',
        'Vuelco',
        'Caída',
        'Otro'
    )}
})

export const ClimaModel = db.define('climas', {
    clima: { type: DataTypes.ENUM(
        'Despejado',
        'Nublado',
        'Lluvia débil',
        'Lluvia intensa',
        'Granizando',
        'Se desconoce'
    )}
})

export const Tipo_VehiculoModel = db.define('tipo_vehiculos', {
    tipo_vehiculo: { type: DataTypes.ENUM(
        'Todo terreno',
        'Turismo',
        'Motocicleta hasta 125cc',
        'Furgoneta',
        'Vehículo articulado',
        'Autobús',
        'Camión rígido',
        'Ciclomotor',
        'Tractocamión',
        'Motocicleta más de 125cc',
        'Bicicleta',
        'Otros vehículos con motor',
        'Bicicleta EPAC',
        'Maquinaria de obras',
        'VMU eléctrico',
        'Se desconoce'
    )}
})

export const Tipo_PersonaModel = db.define('tipo_personas', {
    tipo_persona: { type: DataTypes.ENUM('Conductor', 'Pasajero', 'Peatón', 'Testigo') }
})

export const LesividadModel = db.define('lesividades', {
    codigo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tipo_lesion: { type: DataTypes.ENUM(
        'Atención en urgencias sin posterior ingreso',
        'Ingreso inferior o igual a 24 horas ',
        'Ingreso superior a 24 horas',
        'Fallecido 24 horas ',
        'Asistencia sanitaria ambulatoria con posterioridad ',
        'Asistencia sanitaria inmediata en centro de salud o mutua',
        'Asistencia sanitaria sólo en el lugar del accidente',
        'Sin asistencia sanitaria',
        'Se desconoce'
    ) },
    gravedad: { type: DataTypes.ENUM('Ninguna', 'Leve', 'Grave', 'Fallecido') }

})

SexoModel.hasMany(AccidenteModel, {
    foreignKey: 'sexoId',
    as: 'sexos'
})
AccidenteModel.belongsTo(SexoModel, {
    foreignKey: 'sexoId'
})

//--------------------------------------------------------//

Tipo_PersonaModel.hasMany(AccidenteModel, {
    foreignKey: 'tipoPersonaId',
    as: 'tipo_personas'
})
AccidenteModel.belongsTo(Tipo_PersonaModel, {
    foreignKey: 'tipoPersonaId'
})

//--------------------------------------------------------//

Tipo_VehiculoModel.hasMany(AccidenteModel, {
    foreignKey: 'tipoVehiculoId',
    as: 'tipo_vehiculos'
})
AccidenteModel.belongsTo(Tipo_VehiculoModel, {
    foreignKey: 'tipoVehiculoId'
})

//--------------------------------------------------------//

LesividadModel.hasMany(AccidenteModel,{
    foreignKey: 'lesividadeCodigo',
    as: 'lesividades'
})
AccidenteModel.belongsTo(LesividadModel, {
    foreignKey: 'lesividadeCodigo'
})

//--------------------------------------------------------//

Tipo_AccidenteModel.hasMany(AccidenteModel, {
    foreignKey: 'tipoAccidenteId',
    as: 'tipo_accidentes'
})
AccidenteModel.belongsTo(Tipo_AccidenteModel, {
    foreignKey: 'tipoAccidenteId'
})

//--------------------------------------------------------//

ClimaModel.hasMany(AccidenteModel,{
    foreignKey: 'climaId',
    as: 'climas'
})
AccidenteModel.belongsTo(ClimaModel, {
    foreignKey: 'climaId'
})






