import db from '../db.js';
import { DataTypes } from 'sequelize';

const AccidenteModel = db.define('accidentes', {
    lat: { type: DataTypes.FLOAT },
    lon: { type: DataTypes.FLOAT },
    fecha: { type: DataTypes.DATEONLY },
    hora: { type: DataTypes.TIME },
    localizacion: { type: DataTypes.STRING },
    distrito: { type: DataTypes.STRING },
    accidente: { type: DataTypes.STRING },
    vehiculo: { type: DataTypes.STRING },
    persona: { type: DataTypes.STRING },
    sexo: { type: DataTypes.STRING },
    clima: { type: DataTypes.STRING },
    edad: { type: DataTypes.INTEGER },
    lesividad: { type: DataTypes.INTEGER },
    alcohol: { type: DataTypes.BOOLEAN },
    drogas: { type: DataTypes.BOOLEAN }
})

export default AccidenteModel