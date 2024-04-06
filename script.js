let map;
let directionService;
let directionsRenderer;

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 10,
      center: { lat: 40.7128, lng: -74.0060 }, // Example: New York, NY
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    function calculateRoute(){
        const waypointsInput = document.getElementById("waypointsInput").value;
        const waypointsArray = waypointsInput.split("/n").map(location => {
            return {location: location.trim(), stopover: true};
        });


    const request = {
      origin: waypointsArray[0].location,
      destination: waypointsArray[waypointsArray.length -1].location,
      waypoints:[{location: waypointsArray.slice(1, waypointsArray.length - 1),
      travelMode: "DRIVING",
    };

    directionsService.route(request, (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        const route = response.routes[0];
        let totalDistance = 0;
        let totalDuration = 0;
        route.legs.forEach(leg => {
          totalDistance += leg.distance.value; // Adding the distance of each leg
          totalDuration += leg.duration.value; // Adding the duration of each leg
        });
        const distanceInMiles = totalDistance * 0.000621371; // Convert meters to miles
        const distanceText = distanceInMiles.toFixed(2) + ' miles';
        const durationText = convertSecondsToTimeString(totalDuration);
        document.getElementById('distance').textContent = distanceText;
        document.getElementById('duration').textContent = durationText;
      } else {
        window.alert("Directions request failed due to " + status);
      }
    });
  }

  // Helper function to convert seconds to HH:MM format
  function convertSecondsToTimeString(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours ${minutes} mins`;
  }