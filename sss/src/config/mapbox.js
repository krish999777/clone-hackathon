// Mapbox configuration
// Get your free API key from: https://account.mapbox.com/access-tokens/
// Free tier includes 50,000 map loads per month

export const MAPBOX_CONFIG = {
  // You'll need to get your own API key from Mapbox
  // For now, I'll use a placeholder - you'll need to replace this with your actual key
  accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE',
  style: 'mapbox://styles/mapbox/streets-v12', // You can customize this
  defaultCenter: [72.8777, 19.0760], // Mumbai coordinates [lng, lat]
  defaultZoom: 13
};

// Instructions for getting a free Mapbox API key:
// 1. Go to https://account.mapbox.com/
// 2. Sign up for a free account
// 3. Go to https://account.mapbox.com/access-tokens/
// 4. Copy your default public token
// 5. Add the token to your .env file as REACT_APP_MAPBOX_ACCESS_TOKEN=your_token_here
// 6. Restart your React development server

// Mapbox free tier includes:
// - 50,000 map loads per month
// - 50,000 geocoding requests per month
// - Custom map styles
// - No credit card required
