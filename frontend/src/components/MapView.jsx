import { useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { priceLabel } from '../api';

const KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const ABUJA = { lat: 9.0765, lng: 7.3986 };

function Inner({ properties, center, zoom, onPick, height }) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: KEY });
  const [active, setActive] = useState(null);
  if (!isLoaded) return <div className="skeleton rounded-xl" style={{ height }} />;
  const pts = properties.filter((p) => p.location?.lat && p.location?.lng);
  return (
    <GoogleMap
      mapContainerStyle={{ height, width: '100%', borderRadius: 14 }}
      center={center || (pts[0] ? { lat: pts[0].location.lat, lng: pts[0].location.lng } : ABUJA)}
      zoom={zoom} options={{ streetViewControl: false, mapTypeControl: false }}
      onClick={(e) => onPick?.({ lat: +e.latLng.lat().toFixed(6), lng: +e.latLng.lng().toFixed(6) })}
    >
      {pts.map((p) => <MarkerF key={p._id} position={{ lat: p.location.lat, lng: p.location.lng }} onClick={() => setActive(p)} />)}
      {onPick && center && <MarkerF position={center} />}
      {active && (
        <InfoWindowF position={{ lat: active.location.lat, lng: active.location.lng }} onCloseClick={() => setActive(null)}>
          <div className="max-w-[180px]"><img src={active.images?.[0]?.url} alt="" className="mb-1 h-20 w-full rounded object-cover" />
            <Link to={`/property/${active._id}`} className="block text-sm font-bold text-brand-green">{active.title}</Link>
            <span className="text-xs">{priceLabel(active)}</span></div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}

// properties: array of listings. onPick: makes the map clickable (used by the listing form).
export default function MapView({ properties = [], center, zoom = 12, onPick, height = 380 }) {
  if (!KEY) return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500" style={{ height }}>
      <MapPinOff className="mb-2" /> Add <code className="mx-1 rounded bg-gray-200 px-1">VITE_GOOGLE_MAPS_KEY</code> to enable Google Maps.
    </div>
  );
  return <Inner {...{ properties, center, zoom, onPick, height }} />;
}
