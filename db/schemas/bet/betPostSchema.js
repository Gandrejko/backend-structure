import {Schema} from "../schema.js";
import joi from 'joi';

class BetPostSchema extends Schema {
	constructor(data) {
		super();
		this.data = data;
		this.schema = joi.object({
			id: joi.string().uuid(),
			eventId: joi.string().uuid().required(),
			betAmount: joi.number().min(1).required(),
			prediction: joi.string().valid('w1', 'w2', 'x').required(),
		}).required();
	}
}

export const betPostSchema = new BetPostSchema()