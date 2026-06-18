'use client'

import { useEffect, useRef } from 'react'
import Map, { MapRef, Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

import { LocationResult } from './LocationSearch'

const DEFAULT_LOCATION = {
  longitude: 106.6450735,
  latitude: 10.7496854,
  zoom: 13,
}

export default function LocationPicker({
  location,
}: {
  location: LocationResult | null
}) {
  const mapRef = useRef<MapRef>(null)

  useEffect(() => {
    if (!location || !mapRef.current) return

    mapRef.current.flyTo({
      center: [
        Number(location.longitude),
        Number(location.latitude),
      ],
      zoom: 16,
      duration: 1000,
      essential: true,
    })
  }, [location])

  return (
    <div className="h-125 w-full overflow-hidden rounded-xl border">
      <Map
        ref={mapRef}
        initialViewState={DEFAULT_LOCATION}
        mapStyle={`https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_KEY}`}
      >
        {location && (
          <Marker longitude={location.longitude} latitude={location.latitude} />
        )}
      </Map>
    </div>
  )
}