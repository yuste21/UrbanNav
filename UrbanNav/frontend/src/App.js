import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom"

import Estacionamientos from './estacionamientos/Estacionamientos';
import Accidentes from './accidentes/Accidentes';
import InicioBloque from './pages/Inicio';
import Trafico from './trafico/Trafico';
import Radares from './radares/Radares';
import LineChartTrafico from './trafico/LineChartTrafico';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/accidentes" element={<Accidentes/>} />
          <Route path='/estacionamientos' element={<Estacionamientos/>} /> 
          <Route path='/trafico' element={<Trafico/>} />
          {<Route path='/line' element={<LineChartTrafico/>} />}
          <Route path='/radares' element={<Radares/>} />
          <Route path='/' element={<InicioBloque/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
