import db from '../db.js'
import { DataTypes } from 'sequelize' 

const TraficoModel = db.define('aforos', {
    fecha: { type: DataTypes.DATEONLY },
    estacion: { type: DataTypes.INTEGER },
    fsen: { type: DataTypes.STRING },
    orient: { type: DataTypes.STRING },
    hor1: { type: DataTypes.INTEGER },
    hor2: { type: DataTypes.INTEGER },
    hor3: { type: DataTypes.INTEGER },
    hor4: { type: DataTypes.INTEGER },
    hor5: { type: DataTypes.INTEGER },
    hor6: { type: DataTypes.INTEGER },
    hor7: { type: DataTypes.INTEGER },
    hor8: { type: DataTypes.INTEGER },
    hor9: { type: DataTypes.INTEGER },
    hor10: { type: DataTypes.INTEGER },
    hor11: { type: DataTypes.INTEGER },
    hor12: { type: DataTypes.INTEGER },
    lat: { type: DataTypes.FLOAT },
    lon: { type: DataTypes.FLOAT },
    nombre: { type: DataTypes.STRING }
})

export default TraficoModel