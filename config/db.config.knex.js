import dotenv from 'dotenv'

dotenv.config();

export const dbConfig = {
	development: {
		client: "postgresql",
		connection: {
			port: process.env.DATABASE_PORT,
			host: process.env.DATABASE_HOST,
			database: process.env.DATABASE_NAME,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_ACCESS_KEY,
			dialect: process.env.DATABASE_DIALECT,
		},
		migrations: {
			directory: "./database/migrations",
			tableName: "knex_migrations",
		},
		seeds: {
			directory: "./database/seeds",
		},
		pool: {
			min: 0,
			max: 20,
		},
	},
};
