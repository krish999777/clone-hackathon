// Google Maps configuration
// For development, you can use a test API key or get a free one from Google Cloud Console
// https://console.cloud.google.com/google/maps-apis/overview

export const GOOGLE_MAPS_CONFIG = {
  // You'll need to get your own API key from Google Cloud Console
  // For now, I'll use a placeholder - you'll need to replace this with your actual key
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
  version: 'weekly',
  libraries: ['places', 'geometry']
};

// Instructions for getting a free Google Maps API key:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable these APIs:
//    - Maps JavaScript API
//    - Geocoding API
//    - Places API (optional)
// 4. Create credentials (API Key)
// 5. Add the key to your .env file as REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
// 6. Set up billing (required but you get $200/month free credit)
