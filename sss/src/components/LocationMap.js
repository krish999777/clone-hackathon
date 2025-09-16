import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const LocationMap = ({ coordinates, address }) => {
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Default to Mumbai
  const [mapZoom, setMapZoom] = useState(13);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    console.log('LocationMap coordinates changed:', coordinates);
    if (coordinates && coordinates.lat && coordinates.lon) {
      console.log('Setting map center to:', [coordinates.lat, coordinates.lon]);
      setMapCenter([coordinates.lat, coordinates.lon]);
      setMapZoom(15); // Zoom in more when we have specific coordinates
      setMapError(false);
    }
  }, [coordinates]);

  // Fallback if map fails to load
  if (mapError) {
    return (
      <div className="location-map-container">
        <div className="map-fallback">
          <div className="map-placeholder">
            <div className="map-icon">🗺️</div>
            <div className="map-text">
              <strong>Location Map</strong>
              <br />
              <small>{address || 'Enter address to see location'}</small>
            </div>
          </div>
        </div>
        <div className="map-info">
          <small className="text-muted">
            📍 {coordinates ? 'Location detected' : 'Enter address to see location on map'}
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="location-map-container">
      <MapContainer
        key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '200px', width: '100%' }}
        zoomControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {coordinates && coordinates.lat && coordinates.lon && (
          <Marker position={[coordinates.lat, coordinates.lon]}>
            <Popup>
              <div>
                <strong>Donation Location</strong>
                <br />
                {address || 'Location detected'}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <div className="map-info">
        <small className="text-muted">
          {coordinates ? '📍 Location detected on map' : '📍 Enter address to see location on map'}
        </small>
      </div>
    </div>
  );
};

export default LocationMap;
