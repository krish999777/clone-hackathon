// Mapbox Geocoding utility
// Uses Mapbox Geocoding API for accurate address-to-coordinates conversion

export const geocodeAddressMapbox = async (address) => {
  if (!address || address.trim() === '') return null;
  
  console.log('Geocoding address with Mapbox:', address);
  
  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  
  if (!accessToken || accessToken === 'YOUR_MAPBOX_TOKEN_HERE') {
    console.warn('Mapbox token not found, falling back to OpenStreetMap');
    return await geocodeAddressFallback(address);
  }
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}&limit=1&country=IN`
    );
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Mapbox geocoding response:', data);
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      const coords = {
        lat: lat,
        lon: lng
      };
      console.log('Mapbox geocoded coordinates:', coords);
      return coords;
    }
  } catch (error) {
    console.error('Mapbox geocoding error:', error);
    console.log('Falling back to OpenStreetMap');
    return await geocodeAddressFallback(address);
  }
  
  return null;
};

// Fallback to OpenStreetMap
const geocodeAddressFallback = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    
    console.log('OpenStreetMap geocoding response:', data);
    
    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
      console.log('OpenStreetMap geocoded coordinates:', coords);
      return coords;
    }
  } catch (error) {
    console.error('OpenStreetMap geocoding error:', error);
  }
  
  return null;
};
