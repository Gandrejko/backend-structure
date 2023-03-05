import {Schema} from "../schema.js";
import joi from 'joi';

class EventPutSchema extends Schema {
	constructor(data) {
		super();
		this.data = data;
		this.schema = joi.object({
			score: joi.string().required(),
		}).required();
	}
}

export const eventPutSchema = new EventPutSchema()