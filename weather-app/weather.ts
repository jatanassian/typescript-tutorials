import { fetchLocationData } from './location';
import type { LocationInfo } from './location';

const GEOCODE_API_URL = 'https://geocode.maps.co/search';
const WEATHER_API_URL = 'https://api.open-meteo/v1/forecast';

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
	let locationInfo: LocationInfo;
	try {
		locationInfo = await fetchLocationData(GEOCODE_API_URL, location);
	} catch (error) {
		console.error(error);
		return 1;
	}

	console.log(locationInfo);
	// Fetch weather data
	// Display weather data
	return await Promise.resolve(0);
}

main().catch(err => console.error(err));
