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

	create(user: User): Promise<User> {}
	findByEmail(email: string): Promise<User | undefined> {}
	get(userId: number): Promise<User | undefined> {}
}
