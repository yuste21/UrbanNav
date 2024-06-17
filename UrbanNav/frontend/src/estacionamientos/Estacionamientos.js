import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavbarPage from "../navbar/navbar";
import Loader from "../loader/Loader";
import MapEstacionamientos from "./MapEstacionamientos";
import { 
    getDataEstacionamientosFiltro, 
    getDataEstacionamientosInicio, 
    initialFilter 
} from "../features/estacionamiento/dataEstacionamientoSlice";

function Estacionamientos () {
    const dispatch = useDispatch()
    const loading = useSelector(state => state.estacionamientos.loading)
    
    useEffect(() => {
        cargaInicial()
    }, [])

    const cargaInicial = async() => {
        dispatch(getDataEstacionamientosInicio())
    }

    const handleFilter = async (filtro) => {
        if (filtro !== initialFilter) {
            dispatch(getDataEstacionamientosFiltro({ filtro }))
        } else {
            cargaInicial()
        }
    }

    return(
        <div>
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