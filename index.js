// Import axios for Node.js environment
if (typeof require !== 'undefined') {
    var axios = require('axios');
}

// Initialize global variables
if (typeof global !== 'undefined') {
    // Test environment
    if (!global.markers) global.markers = [];
    if (!global.map) {
        global.map = {
            removeLayer: () => {},
            fitBounds: () => {}
        };
    }
} else {
    // Browser environment
    window.markers = [];
    window.map = L.map("map").setView([45.02, -93.36], 13);
    
    // Add a tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);
}

// Function to add a marker based on latitude and longitude
function addMarker(lat, lng, address) {
    var marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<strong>${address}</strong>`)
        .openPopup();

    markers.push(marker);
    fitMapToMarkers(); // Fit map after adding marker
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

// Add this helper function for rate limiting
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Modify the addAddresses function
async function addAddresses() {
    var addresses = document.getElementById("address-input").value.split("\n");
    var statusElement = document.getElementById("status");

    statusElement.innerText = "";

    if (addresses.length === 0 || addresses[0] === "") {
        statusElement.innerText = "Please enter at least one address.";
        return;
    }

    // Process addresses sequentially with delay
    for (const address of addresses) {
        const trimmedAddress = address.trim();
        if (trimmedAddress === "") continue;

        try {
            await sleep(1000); // Wait 1 second between requests
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmedAddress)}`
            );

            if (response.data.length > 0) {
                var lat = response.data[0].lat;
                var lng = response.data[0].lon;
                addMarker(lat, lng, trimmedAddress);
                statusElement.innerText += `✅ Address added: ${trimmedAddress}\n`;
            } else {
                statusElement.innerText += `❌ Address not found: ${trimmedAddress}\n`;
            }
        } catch (error) {
            statusElement.innerText += `❌ Error geocoding address: ${trimmedAddress}\n`;
            console.error(error);
        }
    }
}

// Add this function after the addMarker function
function fitMapToMarkers() {
    if (markers.length === 0) return;

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addMarker,
        resetMap,
        addAddress,
        addAddresses,
        fitMapToMarkers,
        sleep
    };
} 