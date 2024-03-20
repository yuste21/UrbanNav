import { useCallback, useState, useMemo, useRef } from "react"
import { useMap, Marker, Popup } from "react-leaflet"

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
      <button className="btn btn-secondary" onClick={onClick}>Centrar Mapa</button>
    </p>
  )
}

export function DraggableMarker() {
  const [draggable, setDraggable] = useState(false)
  const [position, setPosition] = useState(center)
  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
        }
      },
    }),
    [],
  )
  const toggleDraggable = useCallback(() => {
    setDraggable((d) => !d)
  }, [])

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
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