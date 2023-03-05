import {Router} from "express";
import jwt from "jsonwebtoken";
import {statsService} from "../services/stats.service.js";

const router = Router();

router.get("/", (req, res) => {
	try {
		let token = req.headers.authorization;
		if (!token) {
			return res.status(401).send({error: 'Not Authorized'});
		}
		token = token.replace('Bearer ', '');
		try {
			const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
			if (tokenPayload.type !== 'admin') {
				return res.status(401).send({error: 'Not Authorized'});
			}
		} catch (err) {
			return res.status(401).send({error: 'Not Authorized'});
		}
		res.send(statsService.getStats());
	} catch (err) {
		return res.status(500).send("Internal Server Error");
	}
});

export const statsRoutes = router;