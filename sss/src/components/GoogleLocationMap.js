import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { GOOGLE_MAPS_CONFIG } from '../config/googleMaps';
import './GoogleLocationMap.css';

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="map-loading">Loading map...</div>;
    case Status.FAILURE:
      return <div className="map-error">Failed to load map</div>;
    default:
      return null;
  }
};

const GoogleMapComponent = ({ coordinates, address }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: coordinates ? { lat: coordinates.lat, lng: coordinates.lon } : { lat: 19.0760, lng: 72.8777 },
        zoom: coordinates ? 15 : 13,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        gestureHandling: 'none',
        clickableIcons: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [map, coordinates]);

  useEffect(() => {
    if (map && coordinates) {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Add new marker
      const marker = new window.google.maps.Marker({
        position: { lat: coordinates.lat, lng: coordinates.lon },
        map: map,
        title: 'Donation Location',
        animation: window.google.maps.Animation.DROP
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>Donation Location</strong><br/>
            ${address || 'Location detected'}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Center map on marker
      map.setCenter({ lat: coordinates.lat, lng: coordinates.lon });
      map.setZoom(15);

      markerRef.current = marker;
    }
  }, [map, coordinates, address]);

  return (
    <div className="google-map-container">
      <div ref={mapRef} className="google-map" />
      <div className="map-info">
        <small className="text-muted">
          {coordinates ? '📍 Location detected on map' : '📍 Enter address to see location on map'}
        </small>
      </div>
    </div>
  );
};

const GoogleLocationMap = ({ coordinates, address }) => {
  return (
    <div className="location-map-container">
      <Wrapper apiKey={GOOGLE_MAPS_CONFIG.apiKey} render={render}>
        <GoogleMapComponent coordinates={coordinates} address={address} />
      </Wrapper>
    </div>
  );
};

export default GoogleLocationMap;
