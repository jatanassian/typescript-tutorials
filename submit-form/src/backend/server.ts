import path from 'path';
import cookie from '@fastify/cookie';
import formBody from '@fastify/formbody';
import staticFiles from '@fastify/static';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import nunjucks from 'nunjucks';
import { z } from 'zod';

import { connect, newDb, SqliteSession, SqliteUserRepository } from './db';

dotenv.config();

const environment = process.env.NODE_ENV;
const cookieSecret = process.env.COOKIE_SECRET;
if (cookieSecret === undefined) {
	console.error('must set COOKIE_SECRET environment');
	process.exit(1);
}

const templates = new nunjucks.Environment(
	new nunjucks.FileSystemLoader('src/backend/templates')
);
const USERS_DB = './users.sqlite';

const fastify = Fastify({
	logger: true,
});

{
	fastify.register(formBody);
	fastify.register(cookie, {
		secret: cookieSecret,
	});
	fastify.register(staticFiles, {
		root: path.join(__dirname, '../../dist'),
	});
}

fastify.get('/', async (request, reply) => {
	await reply.redirect('/signin');
});

fastify.get('/signup', async (request, reply) => {
	const rendered = templates.render('signup.njk', { environment });
	return await reply
		.header('Content-Type', 'text/html; charset=utf-8')
		.send(rendered);
});

fastify.get('/signin', async (request, reply) => {
	const rendered = templates.render('signin.njk', { environment });
	return await reply
		.header('Content-Type', 'text/html; charset=utf-8')
		.send(rendered);
});

const start = async (): Promise<void> => {
	try {
		const db = await connect(USERS_DB);
		newDb(db);
		await fastify.listen({ port: 8089 });
	} catch (error) {
		fastify.log.error(error);
		process.exit(1);
	}
};

start();
