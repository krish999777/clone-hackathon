// Test the new expiry calculation logic
function calculateExpiry(preparedDateStr, hoursToExpire) {
  const preparedDate = new Date(preparedDateStr);
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

// Test scenarios
const now = new Date();

// Test 1: Prepared 2 days ago (Sept 15), expires in 6 hours
const prepared2DaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const expiry1 = calculateExpiry(prepared2DaysAgo.toISOString().split('T')[0], 6);
console.log('\nTest 1 - Prepared 2 days ago, expires in 6 hours:');
console.log('Expiry date:', expiry1.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry1.getTime() - now.getTime()) / (1000 * 60 * 60)));

// Test 2: Prepared yesterday, expires in 12 hours
const preparedYesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
const expiry2 = calculateExpiry(preparedYesterday.toISOString().split('T')[0], 12);
console.log('\nTest 2 - Prepared yesterday, expires in 12 hours:');
console.log('Expiry date:', expiry2.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry2.getTime() - now.getTime()) / (1000 * 60 * 60)));

// Test 3: Prepared today, expires in 24 hours
const preparedToday = new Date(now.getTime());
const expiry3 = calculateExpiry(preparedToday.toISOString().split('T')[0], 24);
console.log('\nTest 3 - Prepared today, expires in 24 hours:');
console.log('Expiry date:', expiry3.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry3.getTime() - now.getTime()) / (1000 * 60 * 60)));

// Test 4: Prepared 3 days ago, expires in 6 hours (should be expired)
const prepared3DaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
const expiry4 = calculateExpiry(prepared3DaysAgo.toISOString().split('T')[0], 6);
console.log('\nTest 4 - Prepared 3 days ago, expires in 6 hours:');
console.log('Expiry date:', expiry4.toISOString());
console.log('Time remaining (hours):', Math.floor((expiry4.getTime() - now.getTime()) / (1000 * 60 * 60)));
console.log('Is expired:', expiry4 < now);
