const GEOCODE_API_URL = 'https://geocode.maps.co/search';

/**
 *
 * @return {Promise<number>}
 */
async function main(): Promise<number> {
	if (process.argv.length !== 3) {
		console.error('usage: weather LOCATION');
		return 1;
	}

	// Get location
	const location = process.argv[2];

	// Convert location to lat/long
	// Fetch weather data
	// Display weather data
	return await Promise.resolve(0);
}

main().catch(err => console.error(err));
