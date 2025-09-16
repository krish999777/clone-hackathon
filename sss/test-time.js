// Test time calculation logic
function timeLabel(expiryOn) {
  if (!expiryOn) return '—';
  
  const expiryDate = new Date(expiryOn);
  const now = new Date();
  
  // Calculate time remaining in milliseconds
  const timeRemaining = expiryDate.getTime() - now.getTime();
  
  // If expired, show "Expired"
  if (timeRemaining <= 0) return 'Expired';
  
  // Convert to different time units
  const minutes = Math.floor(timeRemaining / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // Format time remaining
  if (minutes < 1) return 'Expires now';
  if (minutes < 60) return `Expires in ${minutes} min`;
  if (hours < 24) return `Expires in ${hours} hr`;
  if (days < 7) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
  
  // For longer periods, show date and time
  const timeString = expiryDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const dateString = expiryDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  return `${dateString} ${timeString}`;
}

// Test scenarios
const now = new Date();

// Test 1: Expires in 6 hours
const expiresIn6Hours = new Date(now.getTime() + 6 * 60 * 60 * 1000);
console.log('Expires in 6 hours:', timeLabel(expiresIn6Hours.toISOString()));

// Test 2: Expires in 30 minutes
const expiresIn30Min = new Date(now.getTime() + 30 * 60 * 1000);
console.log('Expires in 30 minutes:', timeLabel(expiresIn30Min.toISOString()));

// Test 3: Expires in 2 days
const expiresIn2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
console.log('Expires in 2 days:', timeLabel(expiresIn2Days.toISOString()));

// Test 4: Already expired
const expired = new Date(now.getTime() - 1 * 60 * 60 * 1000);
console.log('Already expired:', timeLabel(expired.toISOString()));

// Test 5: Your specific scenario - prepared 2 days ago, expires in 6 hours
const prepared2DaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const expiresIn6HoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
console.log('Prepared 2 days ago, expires in 6 hours:', timeLabel(expiresIn6HoursFromNow.toISOString()));
