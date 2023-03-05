import express from 'express';
import knex from 'knex';
import jwt from 'jsonwebtoken';
import joi from 'joi';
import ee from 'events';
import {routes} from "./api/routes/index.js";

import {dbConfig} from "./config/db.config.knex.js";

const app = express();

const port = 3000;

const statEmitter = new ee();
const stats = {
	totalUsers: 3,
	totalBets: 1,
	totalEvents: 1,
};

let db;
app.use(express.json());
app.use((uselessRequest, uselessResponse, neededNext) => {
	db = knex(dbConfig.development);
	db.raw('select 1+1 as result').then(function () {
		neededNext();
	}).catch(() => {
		throw new Error('No db connection');
	});
});

routes(app);

app.get("/health", (req, res) => {
	res.send("Hello World!");
});

app.get("/stats", (req, res) => {
	try {
		let token = req.headers['authorization'];
		if (!token) {
			return res.status(401).send({error: 'Not Authorized'});
		}
		token = token.replace('Bearer ', '');
		try {
			var tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
			if (tokenPayload.type != 'admin') {
				throw new Error();
			}
		} catch (err) {
			return res.status(401).send({error: 'Not Authorized'});
		}
		res.send(stats);
	} catch (err) {
		console.log(err);
		res.status(500).send("Internal Server Error");
		return;
	}
});

const server = app.listen(port, () => {
	statEmitter.on('newUser', () => {
		stats.totalUsers++;
	});
	statEmitter.on('newBet', () => {
		stats.totalBets++;
	});
	statEmitter.on('newEvent', () => {
		stats.totalEvents++;
	});

	console.log(`App listening at http://localhost:${port}`);
});

// Do not change this line
export {app, server};
