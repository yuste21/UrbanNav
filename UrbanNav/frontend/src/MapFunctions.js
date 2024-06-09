import { useCallback, useState, useMemo, useRef, useEffect } from "react"
import { useMap, Marker, Popup } from "react-leaflet"
import { iconos } from "./markerIcons"
import { handleChange, olvidar } from "./features/accidente/dataAccidenteSlice"
import { useDispatch, useSelector } from "react-redux"

export const center = [40.41688189428294, -3.703318510771146]
export const zoom = 11

/* Animated Panning */
export const SetViewOnClick = () => {
  const map = useMap()
  
  map.on('click', (e) => {
      map.setView(e.latlng, map.getZoom(), {
          animate: true
      })
  })
}

/* External state - Centrar mapa */
export function DisplayPosition({ map }) {
  const onClick = useCallback(() => {
    map.setView(center, zoom)
  }, [map])

  return (
    <p>
      <button className="btn btn-genius" onClick={onClick}>Centrar Mapa</button>
    </p>
  )
}

export function DraggableMarker({ markerPosition, setMarkerPosition, filtro }) {
  const dispatch = useDispatch()
  const [draggable, setDraggable] = useState(false)
  const [position, setPosition] = useState(filtro.radio.recordar ? filtro.radio.posicion : center)
  
  useEffect(() => {
    // if(filtro.radio.recordar) {
    //   console.log('Recuerda = ' + filtro.radio.posicion)
    //   setPosition(filtro.radio.posicion)
    //   dispatch(olvidar())
    //   setMarkerPosition(filtro.radio.posicion)
    // } else {
    dispatch(handleChange({ name: 'posicion', value: [markerPosition[0], markerPosition[1]] }))
    //}
  }, [position])

  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const newPosition = marker.getLatLng()
          const newPositionArray = [newPosition.lat, newPosition.lng]
          setPosition(newPosition)
          setMarkerPosition(newPositionArray)
          dispatch(handleChange({ name: 'posicion', value: [markerPosition[0], markerPosition[1]] }))
          console.log('Posicion: ' + position + ' ' + markerPosition + ' ' + newPosition)
        }
      },
    }),
    [setMarkerPosition],
  )
  const toggleDraggable = useCallback(() => {
    setDraggable((d) => !d)
  }, [])

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      icon={iconos.rojo}
      ref={markerRef}>
      <Popup minWidth={90}>
        <span onClick={toggleDraggable}>
          {draggable
            ? 'Puedes arrastrar el marcador'
            : 'Haz click aquí para poder arrastrar el marcador'}
        </span>
      </Popup>
    </Marker>
  )
}