import { z } from 'zod';
import type { AxiosStatic } from 'axios';

// .object() checks the properties exist
const locationInfoSchema = z.object({
	lat: z.string(), // .string() checks to make sure the data is the correct type
	lon: z.string(),
	display_name: z.string(),
});

// infer allows zod to build the object properly
export type LocationInfo = z.infer<typeof locationInfoSchema>;

export async function fetchLocationData(
	axios: AxiosStatic,
	url: string,
	locationName: string
): Promise<LocationInfo> {
	const options = {
		method: 'GET',
		url,
		params: {
			q: locationName,
		},
	};

	const response = await axios.request(options);

	if (response.status === 200) {
		try {
			// .parse() function from zod makes sure the response fits with our object (avoid properties and type checks)
			return locationInfoSchema.parse(response.data[0]);
		} catch (err) {
			console.error(err);
			throw new Error(
				`Unable to find location information for ${locationName}.`
			);
		}
	} else {
		throw new Error('Failed to fetch location data.');
	}
}
