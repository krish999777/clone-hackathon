// Test the new expiry calculation logic with correct date
function calculateExpiry(preparedDateStr, hoursToExpire) {
  const preparedDate = new Date(preparedDateStr + 'T00:00:00'); // Set to start of day
  const now = new Date();
  
  console.log('Prepared date:', preparedDate.toISOString());
  console.log('Current date:', now.toISOString());
  console.log('Hours to expire:', hoursToExpire);
  
  // If prepared date is in the past, calculate expiry from now + remaining hours
  let expiryDate;
  if (preparedDate < now) {
    // Calculate how many hours have passed since prepared date
    const hoursPassed = Math.floor((now.getTime() - preparedDate.getTime()) / (1000 * 60 * 60));
    const remainingHours = Math.max(0, hoursToExpire - hoursPassed);
    
    console.log('Hours passed since prepared:', hoursPassed);
    console.log('Remaining hours:', remainingHours);
    
    if (remainingHours > 0) {
      // Set expiry to now + remaining hours
      expiryDate = new Date(now.getTime() + remainingHours * 60 * 60 * 1000);
    } else {
      // Already expired
      expiryDate = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    }
  } else {
    // Prepared date is today or in the future, calculate normally
    expiryDate = new Date(
      preparedDate.getTime() + hoursToExpire * 60 * 60 * 1000
    );
  }
  
  return expiryDate;
}

// Test scenarios - using September 17th as today
const now = new Date();

// Test 1: Prepared 2 days ago (Sept 15), expires in 6 hours
const prepared2DaysAgo = '2025-09-15';
const expiry1 = calculateExpiry(prepared2DaysAgo, 6);
console.log('\nTest 1 - Prepared 2 days ago (Sept 15), expires in 6 hours:');
console.log('Expiry date:', expiry1.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry1.getTime() - now.getTime()) / (1000 * 60 * 60)));

// Test 2: Prepared yesterday (Sept 16), expires in 12 hours
const preparedYesterday = '2025-09-16';
const expiry2 = calculateExpiry(preparedYesterday, 12);
console.log('\nTest 2 - Prepared yesterday (Sept 16), expires in 12 hours:');
console.log('Expiry date:', expiry2.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry2.getTime() - now.getTime()) / (1000 * 60 * 60)));

// Test 3: Prepared today (Sept 17), expires in 24 hours
const preparedToday = '2025-09-17';
const expiry3 = calculateExpiry(preparedToday, 24);
console.log('\nTest 3 - Prepared today (Sept 17), expires in 24 hours:');
console.log('Expiry date:', expiry3.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry3.getTime() - now.getTime()) / (1000 * 60 * 60)));
