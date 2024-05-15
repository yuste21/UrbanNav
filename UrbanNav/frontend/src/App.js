import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom"

import InicioBloque from './pages/Inicio';
import Estacionamientos from './estacionamientos/Estacionamientos';
import Accidentes from './accidentes/Accidentes';
import Trafico from './trafico/Trafico';
import Radares from './radares/Radares';
import Multas from './radares/Multas';
import FlujoTrafico from './trafico/FlujoTrafico';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/accidentes" element={<Accidentes/>} />
          <Route path='/estacionamientos' element={<Estacionamientos/>} /> 
          <Route path='/trafico' element={<Trafico/>} />
          <Route path='/flujo' element={<FlujoTrafico/>} />
          <Route path='/radares' element={<Radares/>} />
          <Route path='/multas' element={<Multas/>} />
          <Route path='/' element={<InicioBloque/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
