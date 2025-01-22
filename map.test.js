/**
 * @jest-environment jsdom
 */

// Mock Leaflet
const mockOpenPopup = jest.fn();
const mockAddTo = jest.fn().mockReturnThis();
const mockBindPopup = jest.fn(() => ({ openPopup: mockOpenPopup }));
const mockMarker = jest.fn(() => ({
    addTo: mockAddTo,
    bindPopup: mockBindPopup
}));

const mockRemoveLayer = jest.fn();
const mockFitBounds = jest.fn();
const mockSetView = jest.fn().mockReturnThis();

const mockMap = {
    setView: mockSetView,
    removeLayer: mockRemoveLayer,
    fitBounds: mockFitBounds
};

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Setup the DOM environment
document.body.innerHTML = `
    <div id="map"></div>
    <textarea id="address-input"></textarea>
    <div id="status"></div>
`;

// Import and setup global variables that would normally be set by Leaflet
global.L = {
    map: jest.fn(() => mockMap),
    marker: mockMarker,
    tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
    featureGroup: jest.fn(() => ({
        getBounds: jest.fn(() => ({
            pad: jest.fn(() => 'bounds')
        }))
    }))
};

// Make sure global.map is set before importing index.js
global.map = mockMap;
global.markers = [];

// Import the functions we want to test
const {
    addMarker,
    resetMap,
    addAddress,
    addAddresses,
    fitMapToMarkers,
    sleep
} = require('./index.js');

// Make functions available globally for onclick handlers
global.addMarker = addMarker;
global.resetMap = resetMap;
global.addAddress = addAddress;
global.addAddresses = addAddresses;
global.fitMapToMarkers = fitMapToMarkers;
global.sleep = sleep;

describe('Dynamic Address Map', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Reset markers array
        global.markers = [];
        // Reset status
        document.getElementById('status').innerText = '';
        // Reset axios mock
        axios.get.mockReset();
    });

    test('addMarker adds a marker to the map', () => {
        const lat = 45.0;
        const lng = -93.0;
        const address = '123 Test St';

        addMarker(lat, lng, address);

        expect(mockMarker).toHaveBeenCalledWith([lat, lng]);
        expect(mockAddTo).toHaveBeenCalled();
        expect(mockBindPopup).toHaveBeenCalledWith(`<strong>${address}</strong>`);
        expect(mockOpenPopup).toHaveBeenCalled();
        expect(global.markers.length).toBe(1);
    });

    test('resetMap removes all markers', () => {
        // Add two markers
        addMarker(45.0, -93.0, 'Address 1');
        addMarker(45.1, -93.1, 'Address 2');
        
        expect(global.markers.length).toBe(2);

        resetMap();

        expect(mockRemoveLayer).toHaveBeenCalledTimes(2);
        expect(global.markers.length).toBe(0);
        expect(document.getElementById('status').innerText).toBe('');
    });

    test('addAddresses handles multiple addresses', async () => {
        const mockResponse = {
            data: [{ lat: 45.0, lon: -93.0 }]
        };
        axios.get.mockResolvedValue(mockResponse);

        document.getElementById('address-input').value = '123 Test St\n456 Mock Ave';
        
        await addAddresses();

        // Wait for all promises to resolve
        await new Promise(process.nextTick);

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(document.getElementById('status').innerText).toContain('✅ Address added: 123 Test St');
        expect(document.getElementById('status').innerText).toContain('✅ Address added: 456 Mock Ave');
    });

    test('addAddresses handles address not found', async () => {
        axios.get.mockResolvedValue({ data: [] });

        document.getElementById('address-input').value = 'Invalid Address';
        
        await addAddresses();

        // Wait for all promises to resolve
        await new Promise(process.nextTick);

        expect(document.getElementById('status').innerText).toContain('❌ Address not found: Invalid Address');
    });

    test('addAddresses handles empty input', async () => {
        document.getElementById('address-input').value = '';
        
        await addAddresses();

        expect(document.getElementById('status').innerText).toBe('Please enter at least one address.');
    });
}); 