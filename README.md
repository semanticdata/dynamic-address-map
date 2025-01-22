# Dynamic Address Map

This is a simple webapp to dynamically map addresses for visual review. It uses [Leaflet](https://leafletjs.com/) and [Axios](https://github.com/axios/axios).

![screenshot](/screenshot.png)

## Testing

The application includes a comprehensive test suite using Jest. Tests cover the following functionality:

- Adding markers to the map
- Resetting the map and removing all markers
- Processing multiple addresses
- Handling invalid addresses
- Error cases for empty input

To run the tests:

```bash
# Install dependencies
npm install

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## © License

Source code in this repository is available under the [MIT License](./LICENSE).
