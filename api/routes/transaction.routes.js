import {Router} from "express";
import {database} from "../../db/connections.js";
import jwt from "jsonwebtoken";
import {transactionValidate} from "../middlewares/transaction.middleware.js";

const router = Router();

router.post("/", transactionValidate, (req, res) => {
	if (res.error) {
		return res.send({error: res.error});
	}

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

	database("user").where('id', req.body.userId).then(([user]) => {
		if (!user) {
			return res.status(400).send({error: 'User does not exist'});
		}
		req.body.card_number = req.body.cardNumber;
		delete req.body.cardNumber;
		req.body.user_id = req.body.userId;
		delete req.body.userId;
		database("transaction").insert(req.body).returning("*").then(([result]) => {
			const currentBalance = req.body.amount + user.balance;
			database("user").where('id', req.body.user_id).update('balance', currentBalance).then(() => {
				['user_id', 'card_number', 'created_at', 'updated_at'].forEach(whatakey => {
					const index = whatakey.indexOf('_');
					let newKey = whatakey.replace('_', '');
					newKey = newKey.split('')
					newKey[index] = newKey[index].toUpperCase();
					newKey = newKey.join('');
					result[newKey] = result[whatakey];
					delete result[whatakey];
				})
				return res.send({
					...result,
					currentBalance,
				});
			});
		});
	}).catch(err => {
		return res.status(500).send("Internal Server Error");
	});
});

export const transactionRoutes = router;