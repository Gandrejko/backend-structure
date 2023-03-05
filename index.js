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

app.post("/bets", (req, res) => {
	var schema = joi.object({
		id: joi.string().uuid(),
		eventId: joi.string().uuid().required(),
		betAmount: joi.number().min(1).required(),
		prediction: joi.string().valid('w1', 'w2', 'x').required(),
	}).required();
	var isValidResult = schema.validate(req.body);
	if (isValidResult.error) {
		res.status(400).send({error: isValidResult.error.details[0].message});
		return;
	}
	;

	let userId;
	try {
		let token = req.headers['authorization'];
		if (!token) {
			return res.status(401).send({error: 'Not Authorized'});
		}
		token = token.replace('Bearer ', '');
		try {
			var tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
			userId = tokenPayload.id;
		} catch (err) {
			console.log(err);
			return res.status(401).send({error: 'Not Authorized'});
		}


		req.body.event_id = req.body.eventId;
		req.body.bet_amount = req.body.betAmount;
		delete req.body.eventId;
		delete req.body.betAmount;
		req.body.user_id = userId;
		db.select().table('user').then((users) => {
			var user = users.find(u => u.id == userId);
			if (!user) {
				res.status(400).send({error: 'User does not exist'});
				return;
			}
			if (+user.balance < +req.body.bet_amount) {
				return res.status(400).send({error: 'Not enough balance'});
			}
			db('event').where('id', req.body.event_id).then(([event]) => {
				if (!event) {
					return res.status(404).send({error: 'Event not found'});
				}
				db('odds').where('id', event.odds_id).then(([odds]) => {
					if (!odds) {
						return res.status(404).send({error: 'Odds not found'});
					}
					let multiplier;
					switch (req.body.prediction) {
						case 'w1':
							multiplier = odds.home_win;
							break;
						case 'w2':
							multiplier = odds.away_win;
							break;
						case 'x':
							multiplier = odds.draw;
							break;
					}
					db("bet").insert({
						...req.body,
						multiplier,
						event_id: event.id
					}).returning("*").then(([bet]) => {
						var currentBalance = user.balance - req.body.bet_amount;
						db('user').where('id', userId).update({
							balance: currentBalance,
						}).then(() => {
							statEmitter.emit('newBet');
							['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at', 'user_id'].forEach(whatakey => {
								var index = whatakey.indexOf('_');
								var newKey = whatakey.replace('_', '');
								newKey = newKey.split('')
								newKey[index] = newKey[index].toUpperCase();
								newKey = newKey.join('');
								bet[newKey] = bet[whatakey];
								delete bet[whatakey];
							});
							return res.send({
								...bet,
								currentBalance: currentBalance,
							});
						});
					});
				});
			});
		});
	} catch (err) {
		console.log(err);
		res.status(500).send("Internal Server Error");
		return;
	}
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
