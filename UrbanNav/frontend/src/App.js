import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom"

import Inicio from './inicio/Inicio';
import Estacionamientos from './estacionamientos/Estacionamientos';
import Accidentes from './accidentes/Accidentes';
import Trafico from './trafico/Trafico';
import Radares from './radares/Radares';
import Multas from './radares/Multas';
import Flujo from './charts/Flujo';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/accidentes" element={<Accidentes/>} />
          <Route path='/estacionamientos' element={<Estacionamientos/>} /> 
          <Route path='/trafico' element={<Trafico/>} />
          <Route path='/flujo' element={<Flujo/>} />
          <Route path='/radares' element={<Radares/>} />
          <Route path='/multas' element={<Multas/>} />
          <Route path='/' element={<Inicio/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
