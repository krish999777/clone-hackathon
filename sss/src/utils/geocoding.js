// Google Maps Geocoding utility
// This will use Google Maps Geocoding API when API key is available
// Falls back to OpenStreetMap for development/testing

export const geocodeAddress = async (address) => {
  if (!address || address.trim() === '') return null;
  
  console.log('Geocoding address:', address);
  
  // Check if Google Maps API key is available
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
    // Use Google Maps Geocoding API
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();
      
      console.log('Google Maps geocoding response:', data);
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const coords = {
          lat: location.lat,
          lon: location.lng
        };
        console.log('Google Maps geocoded coordinates:', coords);
        return coords;
      }
    } catch (error) {
      console.error('Google Maps geocoding error:', error);
    }
  }
  
  // Fallback to OpenStreetMap
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
