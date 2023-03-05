import {Schema} from "../schema.js";
import joi from 'joi';

class UserPostSchema extends Schema {
	constructor(data) {
		super();
		this.data = data;
		this.schema = joi.object({
			id: joi.string().uuid(),
			type: joi.string().required(),
			email: joi.string().email().required(),
			phone: joi.string().pattern(/^\+?3?8?(0\d{9})$/).required(),
			name: joi.string().required(),
			city: joi.string(),
		}).required();
	}
}

export const userPostSchema = new UserPostSchema()