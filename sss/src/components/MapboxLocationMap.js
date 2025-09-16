import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../config/mapbox';
import './MapboxLocationMap.css';

const MapboxLocationMap = ({ coordinates, address }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    // Check if Mapbox token is available
    if (!MAPBOX_CONFIG.accessToken || MAPBOX_CONFIG.accessToken === 'YOUR_MAPBOX_TOKEN_HERE') {
      console.warn('Mapbox token not found, using fallback');
      setMapError(true);
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.style,
        center: coordinates ? [coordinates.lon, coordinates.lat] : MAPBOX_CONFIG.defaultCenter,
        zoom: coordinates ? 15 : MAPBOX_CONFIG.defaultZoom,
        interactive: false, // Non-interactive as requested
        attributionControl: false
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('Mapbox map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('Mapbox map error:', e);
        setMapError(true);
      });

    } catch (error) {
      console.error('Failed to initialize Mapbox map:', error);
      setMapError(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !coordinates) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = new mapboxgl.Marker({
      color: '#10b981', // Green color to match your theme
      scale: 1.2
    })
      .setLngLat([coordinates.lon, coordinates.lat])
      .addTo(map.current);

    // Create popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false
    }).setHTML(`
      <div style="padding: 8px;">
        <strong>Donation Location</strong><br/>
        ${address || 'Location detected'}
      </div>
    `);

    marker.current.setPopup(popup);

    // Center map on marker
    map.current.setCenter([coordinates.lon, coordinates.lat]);
    map.current.setZoom(15);

    console.log('Mapbox marker added at:', coordinates);

  }, [coordinates, address, mapLoaded]);

  // Fallback if map fails to load or no token
  if (mapError || !MAPBOX_CONFIG.accessToken || MAPBOX_CONFIG.accessToken === 'YOUR_MAPBOX_TOKEN_HERE') {
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
                Add Mapbox token to enable interactive map
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
      <div ref={mapContainer} className="mapbox-map" />
      <div className="map-info">
        <small className="text-muted">
          {coordinates ? '📍 Location detected on map' : '📍 Enter address to see location on map'}
        </small>
      </div>
    </div>
  );
};

export default MapboxLocationMap;
