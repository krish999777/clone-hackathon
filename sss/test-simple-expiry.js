// Test the simplified expiry calculation
function calculateExpiry(hoursToExpire) {
  const now = new Date();
  
  // Expiry is always calculated from now + the entered hours, regardless of prepared date
  const expiryDate = new Date(now.getTime() + hoursToExpire * 60 * 60 * 1000);
  
  return expiryDate;
}

// Test scenarios
const now = new Date();

console.log('Current time:', now.toISOString());

// Test 1: 6 hours expiry
const expiry6Hours = calculateExpiry(6);
console.log('\nTest 1 - 6 hours expiry:');
console.log('Expiry time:', expiry6Hours.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry6Hours.getTime() - now.getTime()) / (1000 * 60 * 60)));

// Test 2: 12 hours expiry
const expiry12Hours = calculateExpiry(12);
console.log('\nTest 2 - 12 hours expiry:');
console.log('Expiry time:', expiry12Hours.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry12Hours.getTime() - now.getTime()) / (1000 * 60 * 60)));

// Test 3: 24 hours expiry
const expiry24Hours = calculateExpiry(24);
console.log('\nTest 3 - 24 hours expiry:');
console.log('Expiry time:', expiry24Hours.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry24Hours.getTime() - now.getTime()) / (1000 * 60 * 60)));

// Test 4: 48 hours expiry
const expiry48Hours = calculateExpiry(48);
console.log('\nTest 4 - 48 hours expiry:');
console.log('Expiry time:', expiry48Hours.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry48Hours.getTime() - now.getTime()) / (1000 * 60 * 60)));
