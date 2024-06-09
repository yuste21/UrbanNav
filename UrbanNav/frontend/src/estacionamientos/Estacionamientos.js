import NavbarPage from "../navbar/navbar";
import MapEstacionamientos from "./MapEstacionamientos";
import FormEstacionamientos from "./FormEstacionamientos";
import { URIsEstacionamientos } from "./URIsEstacionamientos";
import { useEffect, useState } from "react";
import axios from 'axios'
import Loader from "../loader/Loader";
import { URIsDistritos } from "../distritos/URIsDistritos";
import { useDispatch, useSelector } from "react-redux";
import { getDataEstacionamientosFiltro, getDataEstacionamientosInicio, initialFilter } from "../features/estacionamiento/dataEstacionamientoSlice";

function Estacionamientos () {
    const dispatch = useDispatch()

    const estacionamientos = useSelector(state => state.estacionamientos.dataEstacionamientos.estacionamientos)
    const loading = useSelector(state => state.estacionamientos.loading)
    const filtro = useSelector(state => state.estacionamientos.filtro)
    const distritos = useSelector(state => state.estacionamientos.dataEstacionamientos.distritos)
    const barrios = useSelector(state => state.estacionamientos.dataEstacionamientos.barrios)

    useEffect(() => {
        cargaInicial()
    }, [])

    const cargaInicial = async() => {
        dispatch(getDataEstacionamientosInicio())
    }

    const handleFilter = async () => {
        if (filtro !== initialFilter) {
            dispatch(getDataEstacionamientosFiltro({ filtro }))
        } else {
            cargaInicial()
        }
    }

    return(
        <div className="padre">
            <NavbarPage></NavbarPage>
            <div className="container">
                {loading ? 
                    <Loader></Loader>
                    :
                    <>
                        <div className="row">
                            <MapEstacionamientos handleFilter={handleFilter} />
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default Estacionamientos