import express from 'express';
import knex from 'knex';
import {routes} from "./api/routes/index.js";
import {statEmitter} from "./helpers/statEmitter.js";
import {dbConfig} from "./config/db.config.knex.js";
import {statsService} from "./api/services/stats.service.js";

const app = express();

const port = 3000;

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

const server = app.listen(port, () => {
	statEmitter.on('newUser', () => {
		statsService.incrementUsers();
	});
	statEmitter.on('newBet', () => {
		statsService.incrementBets();
	});
	statEmitter.on('newEvent', () => {
		statsService.incrementEvents();
	});

	console.log(`App listening at http://localhost:${port}`);
});

// Do not change this line
export {app, server};
