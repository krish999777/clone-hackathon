// Improved geocoding utility with multiple fallbacks
// Uses multiple free geocoding services for better reliability

export const geocodeAddressImproved = async (address) => {
  if (!address || address.trim() === '') return null;
  
  console.log('Geocoding address:', address);
  
  // Try multiple geocoding services in order of reliability
  const geocodingServices = [
    geocodeWithNominatim,
    geocodeWithPhoton,
    geocodeWithPelias
  ];
  
  for (const service of geocodingServices) {
    try {
      const coords = await service(address);
      if (coords) {
        console.log('Geocoding successful with service:', service.name);
        return coords;
      }
    } catch (error) {
      console.warn(`Geocoding failed with ${service.name}:`, error);
    }
  }
  
  console.error('All geocoding services failed');
  return null;
};

// Primary: OpenStreetMap Nominatim (most reliable)
const geocodeWithNominatim = async (address) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=in&addressdetails=1`
  );
  
  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  }
  
  return null;
};

// Fallback 1: Photon (Komoot's geocoding service)
const geocodeWithPhoton = async (address) => {
  const response = await fetch(
    `https://photon.komoot.io/api?q=${encodeURIComponent(address)}&limit=1&lang=en`
  );
  
  if (!response.ok) {
    throw new Error(`Photon API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.features && data.features.length > 0) {
    const [lon, lat] = data.features[0].geometry.coordinates;
    return {
      lat: lat,
      lon: lon
    };
  }
  
  return null;
};

// Fallback 2: Pelias (Mapzen's geocoding service)
const geocodeWithPelias = async (address) => {
  const response = await fetch(
    `https://api.geocode.earth/v1/search?api_key=ge-8a8b8c8d8e8f8g8h8i8j8k8l8m8n8o8p&text=${encodeURIComponent(address)}&size=1`
  );
  
  if (!response.ok) {
    throw new Error(`Pelias API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.features && data.features.length > 0) {
    const [lon, lat] = data.features[0].geometry.coordinates;
    return {
      lat: lat,
      lon: lon
    };
  }
  
  return null;
};
