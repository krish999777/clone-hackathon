import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ImprovedLocationMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ImprovedLocationMap = ({ coordinates, address }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstance.current) {
      try {
        mapInstance.current = L.map(mapRef.current, {
          center: coordinates ? [coordinates.lat, coordinates.lon] : [19.0760, 72.8777],
          zoom: coordinates ? 15 : 13,
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
          attributionControl: false
        });

        // Add tile layer with multiple fallbacks for better reliability
        const tileLayers = [
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
          'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png'
        ];

        let tileLayerIndex = 0;
        const addTileLayer = () => {
          if (tileLayerIndex < tileLayers.length) {
            const tileLayer = L.tileLayer(tileLayers[tileLayerIndex], {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            });

            tileLayer.addTo(mapInstance.current);
            
            tileLayer.on('tileerror', () => {
              console.log(`Tile layer ${tileLayerIndex} failed, trying next...`);
              tileLayerIndex++;
              if (tileLayerIndex < tileLayers.length) {
                mapInstance.current.removeLayer(tileLayer);
                addTileLayer();
              }
            });

            tileLayer.on('tileload', () => {
              setMapLoaded(true);
              console.log('Map tiles loaded successfully');
            });
          } else {
            console.error('All tile layers failed');
            setMapError(true);
          }
        };

        addTileLayer();

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setMapError(true);
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !mapLoaded || !coordinates) return;

    // Remove existing marker
    if (markerRef.current) {
      mapInstance.current.removeLayer(markerRef.current);
    }

    // Add new marker
    markerRef.current = L.marker([coordinates.lat, coordinates.lon], {
      icon: L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
      })
    }).addTo(mapInstance.current);

    // Add popup
    markerRef.current.bindPopup(`
      <div style="padding: 8px;">
        <strong>Donation Location</strong><br/>
        ${address || 'Location detected'}
      </div>
    `);

    // Center map on marker
    mapInstance.current.setView([coordinates.lat, coordinates.lon], 15);

    console.log('Marker added at:', coordinates);

  }, [coordinates, address, mapLoaded]);

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
              <br />
              <small style={{ color: '#dc2626', fontSize: '0.7rem' }}>
                Map temporarily unavailable
              </small>
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
      <div ref={mapRef} className="improved-map" />
      <div className="map-info">
        <small className="text-muted">
          {coordinates ? '📍 Location detected on map' : '📍 Enter address to see location on map'}
        </small>
      </div>
    </div>
  );
};

export default ImprovedLocationMap;
