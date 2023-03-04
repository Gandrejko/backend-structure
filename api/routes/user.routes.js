import {Router} from "express";
import {userGetSchema} from "../../db/schemas/user/userGetSchema.js";
import {database} from "../../db/connections.js";

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

export const userRoutes = router;