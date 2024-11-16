
////////////////////////////////////////////////////////////////////////////////////
///   Getting values from .ejs template -> can't access directly from .js file  ////
////////////////////////////////////////////////////////////////////////////////////

const lat = latitude || 28.644800;  // Default latitude (Delhi)
const lng = longitude || 77.216721; // Default longitude (Delhi)
const locationAddress = address || "Unknown Road";
const zoomLevel = zoom;
const markerMove = draggableMarker || false;
const apiKey = map_apiKey || 'unknownUser';

// To Store current position of the draggable marker to send it with the form to backend
var currentLat = lat;
var currentLng = lng;


////////////////////////////////////////////////////////////////////////////////////
////////////                        Map Setup                        ///////////////
////////////////////////////////////////////////////////////////////////////////////

// Initialize the map centered at given coordinates (Coordinates, zoom level)
const map = L.map('map').setView([lat, lng], zoomLevel); 

// Add Google Street tile layer (needs internet connetion)
var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    attribution: '&copy; Wanderlust',
    subdomains:['mt0','mt1','mt2','mt3']
});
googleStreets.addTo(map);


////////////////////////////////////////////////////////////////////////////////////
////////////                      Marker Setup                       ///////////////
////////////////////////////////////////////////////////////////////////////////////

// Custom Marker
const customIcon = L.icon({
    iconUrl: '/icons/marker.png', // Path to your custom icon
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Add a marker at the provided coordinates
const marker = L.marker([lat, lng], { icon: customIcon, draggable: markerMove }).addTo(map);

// Marker Popup
if(markerMove) {
    marker.bindPopup(`<b>${locationAddress}</b>  <br>Drag marker to exact location.`).openPopup();
} else {
    marker.bindPopup(`<b>${locationAddress}</b>`).openPopup();
}

// Function for Draggable Marker -> getting new coordinates from marker position
marker.on('dragend', function(e) {
    const newLatLng = marker.getLatLng();   // Get the new position of the marker
    currentLat = newLatLng.lat;
    currentLng = newLatLng.lng;
    // console.log(newLatLng.lat, newLatLng.lng);
    marker.setPopupContent("Current Postition: " + newLatLng.lat.toFixed(4) + "°N, " + newLatLng.lng.toFixed(4) + "°E" ).openPopup();  // Update the popup content with new position
    // marker.setPopupContent( locationAddress ).openPopup();   // Can show present address after forward geocoding
});



////////////////////////////////////////////////////////////////////////////////////
////////////                      Layer Control                      ///////////////
////////////////////////////////////////////////////////////////////////////////////

googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

var openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; Wanderlust'
});

googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

// googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
//     maxZoom: 20,
//     subdomains:['mt0','mt1','mt2','mt3']
// });

// googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
//     maxZoom: 20,
//     subdomains:['mt0','mt1','mt2','mt3']
// });

var baseLayers = {
    "Google Street": googleStreets,
    "Google Hybrid": googleHybrid,
    "OpenStreetMap": openStreetMap,
    // "Google Satelite": googleSat,
    // "Google Terrain": googleTerrain,
};

var overlays = {
    "Default Marker": marker,
    // "Custom Marker": marker2
};

L.control.layers(baseLayers, overlays, {collapsed: true}).addTo(map);



// Coordinates -> Object -> String -> Backend -> String -> Object -> Array -> Database
// Getting the current Position of the Marker and sending it to backend (for new and update Listing)

function fetchCurrentPosition(event) {
    event.preventDefault(); // Prevent default form submission

    // Assuming currentLat and currentLng are set when the marker is moved
    console.log("Current Position: " + currentLat.toFixed(4) + " And " + currentLng.toFixed(4));

    // Set the coordinates as a geometry object (latitude and longitude) for backend use -> geometry: { "lat": 40.7128, "lng": -74.0060 }
    const geometryInput = document.getElementById('coordinates');
    geometryInput.value = JSON.stringify({ lat: currentLat, lng: currentLng });     //Convert Object to Sting before Sending to backend, At backend we will parse it to Object
    // console.log("Geometry object to submit:", geometryInput.value);

    // Select the correct form by ID
    const form = document.getElementById('ListingForm');
    if (!form) {
        console.error("Add Listing form not found!");
        return;
    }

    form.submit(); // Submit the intended form
}



////////////////////////////////////////////////////////////////////////////////////
////////////                        GeoCoding                        ///////////////
////////////////////////////////////////////////////////////////////////////////////

// const apiKey = '';           // Replace with your actual API key                          
// console.log(apiKey);         //Passing it from backend (.env) using .ejs template and using it here

// Forward Geocoding (Coordinates -> Address)
async function getPlaceName(latitude, longitude) {

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
    
    try {
        const response = await axios.get(url);
        // console.log("Reverse Geocoding Response:", response.data);

        return response.data.results[0].formatted || "Unknown Location";
    } catch (error) {
        console.error("Error fetching place name:", error.message || error);
        return "Unknown Location";
    }
};

// Reverse GeoCoding (Address -> Coordinates)
async function getCoordinates(address) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
    try {
        const response = await axios.get(url);
        // console.log("Forward Geocoding Response:", response.data); // Log full response data

        if (response.data.results && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;
            return { latitude: parseFloat(lat), longitude: parseFloat(lng) };
        } else {
            console.error("Address not found in response.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error.message || error);
        return null;
    }
};



// // Getting the current Position of the Marker, directly sending it as String of Array not Object
// function fetchCurrentPosition(event) {
//     event.preventDefault(); // Prevents form from submitting immediately

//     // Assuming currentLat and currentLng are set when the marker is moved
//     console.log("Current Position: " + currentLat.toFixed(4) + " And " + currentLng.toFixed(4));

//     // Set the coordinates in the hidden input field
//     const coordinatesInput = document.getElementById('coordinates');
//     coordinatesInput.value = JSON.stringify([currentLat, currentLng]); // Make sure it’s an array

    
//     // // Log the form data to verify before submitting
//     // const formData = new FormData(document.querySelector('form'));
//     // formData.forEach((value, key) => {
//     //     console.log(key, value);  // This will log each key-value pair in the form data
//     // });
//     console.log("Coordinates to submit:", coordinatesInput.value); // Logs the JSON string


//     // Submit the form
//     document.querySelector('form').submit();
// }

