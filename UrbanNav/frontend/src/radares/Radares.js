import Loader from "../loader/Loader"
import NavbarPage from "../navbar/navbar"
import { useEffect, useState } from "react"
import MapRadares from "./MapRadares"
import axios from 'axios'

function Radares () {
    const [loading, setLoading] = useState(false)
    const [radares, setRadares] = useState([])

    useEffect(() => {
        const getRadares = async () => {
            setLoading(true)
            try {
                let res = (await axios.get('http://localhost:8000/radares/')).data
                setRadares(res)
            } catch (error) {
                console.error("Error al obtener los radares:", error)
            } finally {
                setLoading(false)
            }
        }
        getRadares()
    }, []) // Este useEffect se ejecuta solo una vez al cargar el componente


    return(
        <>
            <NavbarPage></NavbarPage>
            <div className="container">
                {loading ? 
                    <Loader></Loader>
                    :
                    <div className="row"> 
                        <div className="col">
                            <MapRadares radares={radares} />
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default Radares