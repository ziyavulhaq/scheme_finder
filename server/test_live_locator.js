// Automated test script for Live Partner Locator API
const BASE_URL = "http://localhost:5000";

async function testEndpoint(name, url) {
  console.log(`\n========================================`);
  console.log(`TEST: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`========================================`);
  try {
    const start = Date.now();
    const res = await fetch(url);
    const elapsed = Date.now() - start;
    console.log(`Status: ${res.status} (${elapsed}ms)`);
    if (!res.ok) {
      console.error(`Error response:`, await res.text());
      return false;
    }
    const data = await res.json();
    console.log(`Success: ${data.success}`);
    console.log(`Is Live: ${data.isLive}, Fallback: ${data.fallback}`);
    console.log(`Detected State: ${data.detectedState}`);
    console.log(`Display Name: ${data.displayName}`);
    if (data.sca) {
      console.log(`SCA Found: ${data.sca.name} (${data.sca.shortName || ""}) - Phone: ${data.sca.phone}`);
    } else {
      console.log(`SCA: None found (check official directory fallback link)`);
    }
    console.log(`Total Partners Returned: ${data.total}`);
    if (data.partners && data.partners.length > 0) {
      console.log(`Top 3 Partners:`);
      data.partners.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. [${p.type}] ${p.name}`);
        console.log(`     Distance: ${p.distance} km | Cats: ${p.cats.join(", ")} | Status: ${p.utilizationStatus}`);
      });
    }
    return true;
  } catch (err) {
    console.error(`Failed to execute ${name}:`, err.message);
    return false;
  }
}

async function runAllTests() {
  console.log("Starting Live Partner Locator Tests...");

  // Test 1: Coimbatore (Tamil Nadu) - should match TAHDCO and nearby banks
  await testEndpoint(
    "1. Coimbatore Live Lookup",
    `${BASE_URL}/api/partners/nearby?lat=11.01515&lng=76.976618`
  );

  // Test 2: Delhi - should match DSFDC and Delhi banks
  await testEndpoint(
    "2. Delhi Live Lookup",
    `${BASE_URL}/api/partners/nearby?lat=28.6139&lng=77.2090`
  );

  // Test 3: Mumbai (Maharashtra) - should match MPBCDC and Mumbai banks
  await testEndpoint(
    "3. Mumbai Live Lookup",
    `${BASE_URL}/api/partners/nearby?lat=19.0760&lng=72.8777`
  );

  // Test 4: City forward geocoding query for "Jaipur"
  await testEndpoint(
    "4. Jaipur City Geocode & Lookup",
    `${BASE_URL}/api/partners/nearby?city=Jaipur`
  );

  // Test 5: Category filter test - "education" only (should return SCA)
  await testEndpoint(
    "5. Education Loan Filter (Coimbatore)",
    `${BASE_URL}/api/partners/nearby?lat=11.01515&lng=76.976618&category=education`
  );

  console.log("\nAll locator tests complete!");
}

runAllTests();
