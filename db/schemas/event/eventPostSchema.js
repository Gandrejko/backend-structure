import {Schema} from "../schema.js";
import joi from 'joi';

class EventPostSchema extends Schema {
	constructor(data) {
		super();
		this.data = data;
		this.schema = joi.object({
			id: joi.string().uuid(),
			type: joi.string().required(),
			homeTeam: joi.string().required(),
			awayTeam: joi.string().required(),
			startAt: joi.date().required(),
			odds: joi.object({
				homeWin: joi.number().min(1.01).required(),
				awayWin: joi.number().min(1.01).required(),
				draw: joi.number().min(1.01).required(),
			}).required(),
		}).required();
	}
}

export const eventPostSchema = new EventPostSchema()