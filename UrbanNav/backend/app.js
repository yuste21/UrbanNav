import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import db from './db.js';
import bodyParser from 'body-parser';
import routerAccidente from './src/routes/routesAccidente.js';
import routerEstacionamiento from './src/routes/routesEstacionamiento.js';
import routerRadar from './src/routes/routesRadar.js';
import routerTrafico from './src/routes/routesTrafico.js';
import routerDistrito from './src/routes/routesDistrito.js';
import routerBarrio from './src/routes/routesBarrio.js';
import routerMultas from './src/routes/routesMultas.js';

const port = process.env.PORT
const app = express()

// Configurar el middleware body-parser con un límite de tamaño mayor
// Esto es para que se acepte el body en consultas como cargarZonas en estacionamientos
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors())
app.use(express.json())
app.use('/accidentes', routerAccidente)
app.use('/estacionamientos', routerEstacionamiento)
app.use('/radares', routerRadar)
app.use('/trafico', routerTrafico)
app.use('/distritos', routerDistrito)
app.use('/barrios', routerBarrio)
app.use('/multas', routerMultas)

try {
  await db.authenticate();
  console.log('Conexion a la base de datos exitosa');
} catch (error) {
  console.error(`Error en la conexion a la base de datos: ${error}`);
}

app.get('/', (req,res) => {
    res.send('HOLA MUNDO')
})

app.listen(port, () =>{ 
    console.log(`Server UP running on port ${port}`)  
}) 