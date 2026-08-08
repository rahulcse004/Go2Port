const axios = require('axios');

async function getOptimizedRoute(origin, destination, mapsKey) {
  const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;

  const body = {
    origin: { address: origin },
    destination: { address: destination },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE_OPTIMAL",
    extraComputations: ["FUEL_CONSUMPTION"]
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.travelAdvisory.fuelConsumptionMicroliters'
      }
    });

    const route = response.data.routes[0];
    return {
      time: route.duration,
      distance: (route.distanceMeters / 1000).toFixed(2) + " km",
      // Industry Efficiency: Calculating CO2 (standard truck avg: 0.2kg/km)
      co2: ((route.distanceMeters / 1000) * 0.2).toFixed(2) + " kg"
    };
  } catch (err) {
    console.error("❌ Maps Error:", err.message);
    return null;
  }
}

module.exports = { getOptimizedRoute };