import {Router} from "express";
import {database} from "../../db/connections.js";
import jwt from "jsonwebtoken";
import {eventPutSchema} from "../../db/schemas/event/eventPutSchema.js";
import {statEmitter} from "../../helpers/statEmitter.js";
import {eventValidate} from "../middlewares/event.middleware.js";

const router = Router();

router.post('/', eventValidate, (req, res) => {
	if (res.error) {
		return res.send({error: res.error});
	}

	try {
		let token = req.headers.authorization;
		if (!token) {
			return res.status(401).send({error: 'Not Authorized'});
		}
		token = token.replace('Bearer ', '');
		try {
			const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
			if (tokenPayload.type !== 'admin') {
				throw new Error();
			}
		} catch (err) {
			return res.status(401).send({error: 'Not Authorized'});
		}

		req.body.odds.home_win = req.body.odds.homeWin;
		delete req.body.odds.homeWin;
		req.body.odds.away_win = req.body.odds.awayWin;
		delete req.body.odds.awayWin;

		database("odds").insert(req.body.odds).returning("*").then(([odds]) => {
			delete req.body.odds;
			req.body.away_team = req.body.awayTeam;
			req.body.home_team = req.body.homeTeam;
			req.body.start_at = req.body.startAt;
			delete req.body.awayTeam;
			delete req.body.homeTeam;
			delete req.body.startAt;

			database("event").insert({
				...req.body,
				odds_id: odds.id
			}).returning("*").then(([event]) => {
				statEmitter.emit('newEvent');
				['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at'].forEach(whatakey => {
					const index = whatakey.indexOf('_');
					let newKey = whatakey.replace('_', '');
					newKey = newKey.split('')
					newKey[index] = newKey[index].toUpperCase();
					newKey = newKey.join('');
					event[newKey] = event[whatakey];
					delete event[whatakey];
				});
				['home_win', 'away_win', 'created_at', 'updated_at'].forEach(whatakey => {
					const index = whatakey.indexOf('_');
					let newKey = whatakey.replace('_', '');
					newKey = newKey.split('')
					newKey[index] = newKey[index].toUpperCase();
					newKey = newKey.join('');
					odds[newKey] = odds[whatakey];
					delete odds[whatakey];
				})
				return res.send({
					...event,
					odds,
				});
			})
		});
	} catch (err) {
		return res.status(500).send("Internal Server Error");
	}
});

router.put("/:id", (req, res) => {
	const isValidResult = eventPutSchema.getSchema().validate(req.body);
	if (isValidResult.error) {
		return res.status(400).send({error: isValidResult.error.details[0].message});
	}

	try {
		let token = req.headers.authorization;
		if (!token) {
			return res.status(401).send({error: 'Not Authorized'});
		}
		token = token.replace('Bearer ', '');
		try {
			const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
			if (tokenPayload.type !== 'admin') {
				throw new Error();
			}
		} catch (err) {
			return res.status(401).send({error: 'Not Authorized'});
		}

		const eventId = req.params.id;

		database('bet').where('event_id', eventId).andWhere('win', null).then((bets) => {
			const [w1, w2] = req.body.score.split(":");
			let result;
			if (+w1 > +w2) {
				result = 'w1'
			} else if (+w2 > +w1) {
				result = 'w2';
			} else {
				result = 'x';
			}

			database('event').where('id', eventId).update({score: req.body.score}).returning('*').then(([event]) => {
				Promise.all(bets.map((bet) => {
					if (bet.prediction === result) {
						database('bet').where('id', bet.id).update({
							win: true
						});

						database('user').where('id', bet.user_id).then(([user]) => {
							return database('user').where('id', bet.user_id).update({
								balance: user.balance + (bet.bet_amount * bet.multiplier),
							});
						});
					} else if (bet.prediction !== result) {
						return database('bet').where('id', bet.id).update({
							win: false
						});
					}
				}));

				setTimeout(() => {
					['bet_amount', 'event_id', 'away_team', 'home_team', 'odds_id', 'start_at', 'updated_at', 'created_at'].forEach(whatakey => {
						const index = whatakey.indexOf('_');
						let newKey = whatakey.replace('_', '');
						newKey = newKey.split('')
						newKey[index] = newKey[index].toUpperCase();
						newKey = newKey.join('');
						event[newKey] = event[whatakey];
						delete event[whatakey];
					});
					res.send(event);
				}, 1000)
			});
		});
	} catch (err) {
		return res.status(500).send("Internal Server Error");
	}
});

export const eventRoutes = router;