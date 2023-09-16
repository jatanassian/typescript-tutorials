import formBody from '@fastify/formbody';
import staticFiles from '@fastify/static';
import axios from 'axios';
import dotenv from 'dotenv';
import fastify from 'fastify';
import nunjucks from 'nunjucks';
import path from 'path';

// Get env variables
dotenv.config();
const environment = process.env.NODE_ENV;

// Load templates
const templates = new nunjucks.Environment(
	new nunjucks.FileSystemLoader('src/backend/templates')
);

// Const variables
const GEOCODE_API_URL = 'https://geocode.maps.co/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const HTTP_CLIENT = axios;

// Create server
const server = fastify({ logger: true });

// Middleware to process forms
server.register(formBody);
// Middleware to serve static files
server.register(staticFiles, {
	root: path.join(__dirname, '../../dist'),
});

/**
 * Helper that returns an image depending of the weather code
 * @param {number} code
 * @returns  {string}
 */
const weatherCodeToImage = (code: number): string => {
	switch (code) {
		case 0:
			return '/static/img/clear.svg';
		case 1:
			return '/static/img/clear.svg';
		case 2:
			return '/static/img/cloudy.svg';
		case 3:
			return '/static/img/overcast.svg';
		case 45:
			return '/static/img/fog.svg';
		case 48:
			return '/static/img/fog.svg';
		case 51:
			return '/static/img/drizzle.svg';
		case 53:
			return '/static/img/drizzle.svg';
		case 55:
			return '/static/img/drizzle.svg';
		case 56:
			return '/static/img/drizzle.svg';
		case 57:
			return '/static/img/drizzle.svg';
		case 61:
			return '/static/img/rain.svg';
		case 63:
			return '/static/img/rain.svg';
		case 65:
			return '/static/img/rain.svg';
		case 66:
			return '/static/img/rain.svg';
		case 67:
			return '/static/img/rain.svg';
		case 71:
			return '/static/img/snow.svg';
		case 73:
			return '/static/img/snow.svg';
		case 75:
			return '/static/img/snow.svg';
		case 77:
			return '/static/img/snow.svg';
		case 80:
			return '/static/img/rain.svg';
		case 81:
			return '/static/img/rain.svg';
		case 82:
			return '/static/img/rain.svg';
		case 85:
			return '/static/img/snow.svg';
		case 86:
			return '/static/img/snow.svg';
		case 95:
			return '/static/img/thunderstorm.svg';
		case 96:
			return '/static/img/thunderstorm.svg';
		case 99:
			return '/static/img/thunderstorm.svg';
		default:
			return '/static/img/info.svg';
	}
};
