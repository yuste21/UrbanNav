import { useEffect, useState } from "react"
import NavbarPage from "../navbar/navbar"
import Loader from "../loader/Loader"
import MapDistritos from "./MapDistritos"
import { URIsDistritos } from "./URIsDistritos"
import { URIsBarrios } from "./URIsBarrios"
import axios from 'axios'

function Distritos() {
    const [loading, setLoading] = useState(false)
    const [distritos, setDistritos] = useState([])
    const [barrios, setBarrios] = useState([])

    useEffect(() => {
        cargarDistritos()
    }, [])

    const cargarDistritos = async() => {
        setLoading(true)
        const data = (await axios.get(URIsDistritos.getAll)).data
        setDistritos(data)

        const data2 = (await axios.get(URIsBarrios.getAll)).data
        setBarrios(data2)
        setLoading(false)
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
                        <MapDistritos distritos={distritos}
                                      barrios={barrios}
                        />
                    </div>
                    </>
                }
            </div>
        </div>
    )
}

export default Distritos