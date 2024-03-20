import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom"

import EstacionamientosBloque from './estacionamientos/Estacionamientos';
import AccidentesBloque from './accidentes/Accidentes';
import InicioBloque from './pages/Inicio';
import TraficoBloque from './pages/Trafico';
import Radares from './radares/Radares';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/accidentes" element={<AccidentesBloque/>} />
          <Route path='/estacionamientos' element={<EstacionamientosBloque/>} /> 
          <Route path='/trafico' element={<TraficoBloque/>} />
          <Route path='/radares' element={<Radares/>} />
          <Route path='/' element={<InicioBloque/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
