import path from 'path';
import cookie from '@fastify/cookie';
import formBody from '@fastify/formbody';
import staticFiles from '@fastify/static';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import nunjucks from 'nunjucks';
import { z } from 'zod';

import { connect, newDb, SqliteSession, SqliteUserRepository } from './db';
import { comparePassword, hashPasssword } from './auth';

/******************************
 * Config
 ******************************/
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

/******************************
 * Schemas
 ******************************/

const accountCreateRequestSchema = z.object({
	email: z.string(),
	password: z.string(),
	agreedToTerms: z.string().optional()
});

type AccountCreateRequest = z.infer<typeof accountCreateRequestSchema>;

const accountLoginRequestSchema = z.object({
	email: z.string(),
	password: z.string(),
});

type AccountLoginRequest = z.infer<typeof accountLoginRequestSchema>;

{
	fastify.register(formBody);
	fastify.register(cookie, {
		secret: cookieSecret,
	});
	fastify.register(staticFiles, {
		root: path.join(__dirname, '../../dist'),
	});
}

/******************************
 * Routes
 ******************************/

// Homepage
fastify.get('/', async (request, reply) => {
	await reply.redirect('/signin');
});

// Signin
fastify.get('/signin', async (request, reply) => {
	const rendered = templates.render('signin.njk', { environment });
	return await reply
		.header('Content-Type', 'text/html; charset=utf-8')
		.send(rendered);
});

fastify.post('/account/signin', async (request, reply) => {
	let requestData: AccountLoginRequest;

	try {
		requestData = accountCreateRequestSchema.parse(request.body);
	} catch (error) {
		return await reply.redirect('signup');
	}

	const db = await connect(USERS_DB);
	const userRepository = new SqliteUserRepository(db);

	try {
		const user = await userRepository.findByEmail(requestData.email);
		// If user doesn't exist
		if (user === undefined) {
			// TODO: show error message
			return await reply.redirect('/signin');
		}

		// If wrong password
		const passwordMatches = await comparePassword(requestData.password, user.hashedPassword);
		if (!passwordMatches) {
			// TODO: show error message
			return await reply.redirect('/signin');
		}

		return await reply.redirect('/welcome');
	} catch (error) {
		// TODO: show error message
		return await reply.redirect('/signin');
	}
});

// Signup
fastify.get('/signup', async (request, reply) => {
	const rendered = templates.render('signup.njk', { environment });
	return await reply
		.header('Content-Type', 'text/html; charset=utf-8')
		.send(rendered);
});

fastify.post('/account/signup', async (request, reply) => {
	let requestData: AccountCreateRequest;

	try {
		requestData = accountCreateRequestSchema.parse(request.body);
	} catch (error) {
		return await reply.redirect('signup');
	}

	if (requestData.agreedToTerms !== 'on') {
		return await reply.redirect('signup');
	}

	const db = await connect(USERS_DB);
	const userRepository = new SqliteUserRepository(db);

	const hashedPassword = await hashPasssword(requestData.password);

	try {
		const newUser = {
			...requestData,
			id: 0,
			agreedToTerms: true,
			hashedPassword
		};

		const user = await userRepository.create(newUser);
		console.log(user);
		return await reply.redirect('welcome');
	} catch (error) {
		// TODO: show error message
		return await reply.redirect('signup');
	}
});

/******************************
 * Run server
 ******************************/

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
