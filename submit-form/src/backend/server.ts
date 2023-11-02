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
import { clearFlashCookie, FLASH_MSG_COOKIE } from './flash';
import type { FastifyReply } from 'fastify/types/reply';
import type { FastifyRequest } from 'fastify/types/request';
import { checkUsername } from '../shared/username-rules';
import { checkComplexity } from '../shared/password-rules';

/******************************
 * Config
 ******************************/
dotenv.config();

const SESSION_COOKIE = 'SESSION_ID';

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
	agreedToTerms: z.string().optional(),
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
	fastify.register(clearFlashCookie);
	fastify.register(staticFiles, {
		root: path.join(__dirname, '../../dist'),
	});
}

/******************************
 * Helpers
 ******************************/

function setFlashCookie(reply: FastifyReply, msg: string): void {
	reply.setCookie(FLASH_MSG_COOKIE, msg, { path: '/' });
}

function readFlashCookie(request: FastifyRequest): string | undefined {
	return request.cookies[FLASH_MSG_COOKIE];
}

function setSessionCookie(reply: FastifyReply, sessionId: string): void {
	reply.setCookie(SESSION_COOKIE, sessionId, { path: '/' });
}

function readSessionCookie(request: FastifyRequest): string | undefined {
	return request.cookies[SESSION_COOKIE];
}

/******************************
 * Routes
 ******************************/

// Homepage
fastify.get('/', async (request, reply) => {
	await reply.redirect('/signin');
});

// Welcome
fastify.get('/welcome', async (request, reply) => {
	const sessionId = readSessionCookie(request);

	if (!sessionId) {
		setFlashCookie(reply, 'Please sign in to continue.');
		return await reply.redirect('/login');
	}

	const db = await connect(USERS_DB);
	const sessions = new SqliteSession(db);
	const user = await sessions.get(sessionId);

	if (!user) {
		setFlashCookie(
			reply,
			'Your session has expired. Please sign in to continue.'
		);
		return await reply.redirect('signin');
	}

	const rendered = templates.render('welcome.nkj', {
		environment,
		email: user.email,
	});
	return await reply
		.header('Content-Type', 'text/html; charset=utf-8')
		.send(rendered);
});

// Signin
fastify.get('/signin', async (request, reply) => {
	const serverMsg = readFlashCookie(request);
	const rendered = templates.render('signin.njk', {
		server_msg: serverMsg,
		environment,
	});
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
		const passwordMatches = await comparePassword(
			requestData.password,
			user.hashedPassword
		);
		if (!passwordMatches) {
			// TODO: show error message
			return await reply.redirect('/signin');
		}

		// Create session and add it to cookie
		const sessions = new SqliteSession(db);
		const sessionId = await sessions.create(user.id);
		setSessionCookie(reply, sessionId);

		return await reply.redirect('/welcome');
	} catch (error) {
		// TODO: show error message
		return await reply.redirect('/signin');
	}
});

// Signup
fastify.get('/signup', async (request, reply) => {
	const serverMsg = readFlashCookie(request);
	const rendered = templates.render('signup.njk', {
		server_msg: serverMsg,
		environment,
	});
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

	const usernameFailures = checkUsername(requestData.email);
	if (usernameFailures.length) {
		const formattedErrors = usernameFailures.join('<br>');
		setFlashCookie(reply, formattedErrors);
		return await reply.redirect('/signup');
	}

	const passwordFailures = checkComplexity(requestData.password);
	if (passwordFailures.length) {
		const formattedErrors = passwordFailures.join('<br>');
		setFlashCookie(reply, formattedErrors);
		return await reply.redirect('/signup');
	}

	const db = await connect(USERS_DB);
	const userRepository = new SqliteUserRepository(db);

	const hashedPassword = await hashPasssword(requestData.password);

	try {
		const newUser = {
			...requestData,
			id: 0,
			agreedToTerms: true,
			hashedPassword,
		};

		const user = await userRepository.create(newUser);

		// Create session and add it to cookie
		const sessions = new SqliteSession(db);
		const sessionId = await sessions.create(user.id);
		setSessionCookie(reply, sessionId);

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
