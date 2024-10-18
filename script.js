// Initialize the map
var map = L.map("map").setView([45.02, -93.36], 13);

// Array to keep track of all markers
var markers = [];

// Add a tile layer (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Function to add a marker based on latitude and longitude
function addMarker(lat, lng, address) {
    var marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<strong>${address}</strong>`)
        .openPopup();

    // Store marker in the array for later removal
    markers.push(marker);
}

// Function to reset the map by removing all markers
function resetMap() {
    markers.forEach(function (marker) {
        map.removeLayer(marker);
    });
    markers = []; // Clear the array
    document.getElementById("status").innerText = "";
}

// Function to geocode the address and add it to the map
function addAddress() {
    var address = document.getElementById("address-input").value;
    if (address === "") {
        document.getElementById("status").innerText = "Please enter an address.";
        return;
    }

    // Use a geocoding service (Nominatim in this case via OpenStreetMap)
    axios
        .get(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
        .then(function (response) {
            if (response.data.length > 0) {
                var lat = response.data[0].lat;
                var lng = response.data[0].lon;
                addMarker(lat, lng, address);
                document.getElementById(
                    "status"
                ).innerText = `Address added: ${address}`;
            } else {
                document.getElementById("status").innerText = "Address not found.";
            }
        })
        .catch(function (error) {
            document.getElementById("status").innerText = "Error geocoding address.";
            console.error(error);
        });
}

// Function to geocode multiple addresses and add them to the map
function addAddresses() {
    var addresses = document.getElementById("address-input").value.split("\n");
    var statusElement = document.getElementById("status");

    // Clear status feedback
    statusElement.innerText = "";

    // Check if the input is empty
    if (addresses.length === 0 || addresses[0] === "") {
        statusElement.innerText = "Please enter at least one address.";
        return;
    }

    addresses.forEach(function (address) {
        // Trim whitespace
        address = address.trim();
        if (address === "") return;

        // Use a geocoding service (Nominatim)
        axios
            .get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
            )
            .then(function (response) {
                if (response.data.length > 0) {
                    var lat = response.data[0].lat;
                    var lng = response.data[0].lon;
                    addMarker(lat, lng, address);
                    statusElement.innerText += `✅ Address added: ${address}\n`;
                } else {
                    statusElement.innerText += `❌ Address not found: ${address}\n`;
                }
            })
            .catch(function (error) {
                statusElement.innerText += `❌ Error geocoding address: ${address}\n`;
                console.error(error);
            });
    });

    // Clear the textarea after processing
    document.getElementById("address-input").value = "";
}
