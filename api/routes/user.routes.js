import {Router} from "express";
import {userGetSchema} from "../../db/schemas/user/userGetSchema.js";
import {database} from "../../db/connections.js";
import {userPostSchema} from "../../db/schemas/user/userPostSchema.js";
import {userPutSchema} from "../../db/schemas/user/userPutSchema.js";
import jwt from "jsonwebtoken";
import {statEmitter} from "../../helpers/statEmitter.js";

const router = Router();
router.get('/:id', (req, res) => {
	try {
		const isValidResult = userGetSchema.getSchema().validate(req.params);
		if (isValidResult.error) {
			return res.status(400).send({error: isValidResult.error.details[0].message});
		}

		database('user').where('id', req.params.id).returning("*").then(([result]) => {
			if (!result) {
				return res.status(404).send({error: 'User not found'});
			}
			return res.send({
				...result,
			});
		});
	} catch (err) {
		return res.status(500).send("Internal Server Error");
	}
});

router.post('/', (req, res) => {
	const isValidResult = userPostSchema.getSchema().validate(req.body);
	if (isValidResult.error) {
		return res.status(400).send({error: isValidResult.error.details[0].message});
	}
	req.body.balance = 0;
	database('user').insert(req.body).returning('*').then(([result]) => {
		result.createdAt = result.created_at;
		delete result.created_at;
		result.updatedAt = result.updated_at;
		delete result.updated_at;
		statEmitter.emit('newUser');
		return res.send({
			...result,
			accessToken: jwt.sign({id: result.id, type: result.type}, process.env.JWT_SECRET)
		});
	}).catch(err => {
		if (err.code === '23505') {
			res.status(400).send({
				error: err.detail
			});
			return;
		}
		return res.status(500).send("Internal Server Error", err);
	});
});

router.put('/:id', (req, res) => {
	let token = req.headers.authorization;
	let tokenPayload;
	if (!token) {
		return res.status(401).send({error: 'Not Authorized'});
	}
	token = token.replace('Bearer ', '');

	try {
		tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		return res.status(401).send({error: 'Not Authorized'});
	}

	const isValidResult = userPutSchema.getSchema().validate(req.body);
	if (isValidResult.error) {
		return res.status(400).send({error: isValidResult.error.details[0].message});
	}

	if (req.params.id !== tokenPayload.id) {
		console.log(req.params.id, tokenPayload.id)
		return res.status(401).send({error: 'UserId mismatch'});
	}

	database("user").where('id', req.params.id).update(req.body).returning("*").then(([result]) => {
		return res.send({
			...result,
		});
	}).catch(err => {
		if (err.code === '23505') {
			res.status(400).send({
				error: err.detail
			});
			return;
		}
		return res.status(500).send("Internal Server Error");
	});
});
export const userRoutes = router;