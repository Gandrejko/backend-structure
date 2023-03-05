import {Schema} from "../schema.js";
import joi from 'joi';

class UserPutSchema extends Schema {
	constructor(data) {
		super();
		this.data = data;
		this.schema = joi.object({
			email: joi.string().email(),
			phone: joi.string().pattern(/^\+?3?8?(0\d{9})$/),
			name: joi.string(),
			city: joi.string(),
		}).required();
	}
}

export const userPutSchema = new UserPutSchema()