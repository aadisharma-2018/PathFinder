let map;
let directionsService;
let directionsRenderer;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: { lat: 40.7128, lng: -74.0060 }, // Example: New York, NY
  });
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(position => {
        const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
    map.setCenter(currentLocation);
    }, error => {
      alert("Error getting current location: " + error.message);
  });
} else {
  alert("Geolocation is not supported by this browser.");
  }

  document.getElementById("calculateButton").addEventListener("click", calculateRoute);
}


function calculateRoute() {
  const waypointsInput = document.getElementById("waypointsInput").value.trim();
  if (!waypointsInput) {
    alert("Please enter at least one waypoint.");
    return;
  }

  // Split the input value into an array of addresses
  const addresses = waypointsInput.split("\n").map(address => address.trim());

  // Geocoder instance to obtain coordinates
  const geocoder = new google.maps.Geocoder();
  const locations = [];

  // Get the user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Iterate through each address to geocode and calculate distance
      addresses.forEach((address, index) => {
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === "OK") {
            const location = results[0].geometry.location;
            
            // Calculate distance from current location to waypoint
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
              new google.maps.LatLng(location.lat(), location.lng())
            );

            // Add location and distance to the locations array
            locations.push({ location: location, distance: distance, stopover: true });

            // If all addresses have been processed, proceed to calculate the route
            if (locations.length === addresses.length) {
              // Sort locations based on distance
              locations.sort((a, b) => a.distance - b.distance);

              // Use the sorted locations to construct the Directions API request
              const request = {
                origin: currentLocation,
                destination: locations[locations.length - 1].location, // Destination is the same as origin to create a round trip
                waypoints: locations.slice(0, -1).map(location => ({ location: location.location, stopover: true })),
                travelMode: "DRIVING",
              };

              // Call the Directions API to calculate the route
              directionsService.route(request, (response, status) => {
                if (status === "OK") {
                  directionsRenderer.setDirections(response);
                } else {
                  console.error("Directions request failed due to " + status);
                }
              });
            }
          } else {
            console.error("Geocode failed for address: " + address);
          }
        });
      });
    }, error => {
      alert("Error getting current location: " + error.message);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}



// Helper function to convert seconds to HH:MM format
function convertSecondsToTimeString(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} hours ${minutes} mins`;
}
