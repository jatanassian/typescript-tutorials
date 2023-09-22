import { AsyncDatabase } from 'promised-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface User {
	id: number;
	email: string;
	hashedPassword: string;
	agreedToTerms: boolean;
}

export interface UserRepository {
	create(user: User): Promise<User>;
	findByEmail(email: string): Promise<User | undefined>;
	get(userId: number): Promise<User | undefined>;
}

export class SqliteUserRepository implements UserRepository {
	constructor(private readonly db: AsyncDatabase) {}

	async create(user: User): Promise<User> {
		const userId: { id: number } = await this.db.get(
			'INSERT INTO users (email, password, agreedToTerms) VALUES (?, ?, ?) RETURNING id',
			[user.email, user.hashedPassword, user.agreedToTerms]
		);
		return { ...user, id: userId.id };
	}

	async findByEmail(email: string): Promise<User | undefined> {
		return await this.db.get('SELECT * FROM users WHERE email = ?', email);
	}

	async get(userId: number): Promise<User | undefined> {
		return await this.db.get('SELECT * FROM users WHERE id = ?', userId);
	}
}

// Connect to the database
export async function connect(
	connectionString: string
): Promise<AsyncDatabase> {
	return await AsyncDatabase.open(connectionString);
}

// Create a database
export async function newDb(db: AsyncDatabase): Promise<void> {
	await db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			agreedToTerms BOOLEAN NOT NULL
		);

		CREATE TABLE IF NOT EXISTS sessions (
			session_id UUID PRIMARY KEY,
			user_id INTEGER NOT NULL,
			FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
		);
	`);
}
