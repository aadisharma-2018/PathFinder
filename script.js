let map;
let directionsService;
let directionsRenderer;
let locations = [];

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

  initAutocomplete();
}

document.getElementById('clearListButton').addEventListener('click', function() {
  locations = []; // Clear the locations array
  document.getElementById('locationsList').innerHTML = ''; // Clear the list display
  directionsRenderer.setDirections({ routes: []});
  document.getElementById('distance').textContent = '';
  document.getElementById('duration').textContent = '';
});

function addLocationToList(location) {
  const locationsList = document.getElementById('locationsList');
  const listItem = document.createElement('li');
  listItem.textContent = location;
  locationsList.appendChild(listItem);
}

document.getElementById('addLocationButton').addEventListener('click', function() {
  const inputField = document.getElementById('waypointsInput');
  const location = inputField.value.trim();

  if (location){
    locations.push(location);
    addLocationToList(location);
    clearInputField();
  }  else {
    alert('Please enter a location. ');
  }
});

function clearInputField(){
  document.getElementById('waypointsInput').value = '';
}

function initAutocomplete() {
  const inputField = document.getElementById('waypointsInput');
  const autocomplete = new google.maps.places.Autocomplete(inputField);
}


function calculateRoute() {
  if (locations.length === 0) {
    alert("Please enter at least one waypoint.");
    return;
  }

  const geocoder = new google.maps.Geocoder();
  const currentLocationPromise = new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        resolve(currentLocation);
      }, error => {
        reject("Error getting current location: " + error.message);
      });
    } else {
      reject("Geolocation is not supported by this browser.");
    }

    document.querySelector('p1').style.display = 'block';
  });

  
  currentLocationPromise.then(currentLocation => {
    const origin = encodeURIComponent(currentLocation.lat + "," + currentLocation.lng);


    // Calculate distances for each location
    const locationPromises = locations.map(location => {
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address: location }, (results, status) => {
          if (status === "OK" && results.length > 0) {
            const locationCoords = results[0].geometry.location;
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
              new google.maps.LatLng(locationCoords.lat(), locationCoords.lng())
            );
            resolve({ location: locationCoords, distance: distance, stopover: true });
          } else {
            reject("Geocode failed for address: " + location);
          }
        });
      });
    });

    // Wait for all distance calculations to complete
    Promise.all(locationPromises).then(locationsWithDistances => {
      // Sort locations based on distance
      locationsWithDistances.sort((a, b) => a.distance - b.distance);

      const destinationLocation = locationsWithDistances[locationsWithDistances.length - 1].location;
      const encodedDestination = encodeURIComponent(destinationLocation.lat() + "," + destinationLocation.lng());
      const waypointsForURL = locationsWithDistances.slice(0, -1).map(location => {
        return encodeURIComponent(location.location.lat() + "," + location.location.lng());}).join("|");
    
      // Construct the URL with encoded route information
      const routeURL = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodedDestination}&waypoints=${waypointsForURL}`;
  
      // Display the link to the user
      const linkElement = document.createElement('a');
      linkElement.href = routeURL;
      linkElement.textContent = "Click here to view the optimal route";
      document.body.appendChild(linkElement);

      const waypoints = locationsWithDistances.map(location => {
        return { location: location.location, stopover: true };
      });

      const request = {
        origin: currentLocation,
        destination: waypoints[waypoints.length - 1].location,
        waypoints: waypoints.slice(0, -1),
        travelMode: "DRIVING"
      };

      directionsService.route(request, (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
          let totalDistance = 0;
          let totalDuration = 0;
          response.routes[0].legs.forEach(leg => {
            totalDistance += leg.distance.value;
            totalDuration += leg.duration.value;
          });
          const distanceInMiles = totalDistance * 0.000621371;
          const durationText = convertSecondsToTimeString(totalDuration);
          document.getElementById('duration').textContent = durationText;
          document.getElementById('distance').textContent = distanceInMiles.toFixed(2) + ' miles';
        } else {
          console.error("Directions request failed due to " + status);
        }
      });
    }).catch(error => {
      alert(error);
    });
  }).catch(error => {
    alert(error);
  });

}

function convertSecondsToTimeString(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} hours ${minutes} mins`;
}
