import {Schema} from "../schema.js";
import joi from 'joi';

class UserGetSchema extends Schema {
	constructor(data) {
		super();
		this.data = data;
		this.schema = joi.object({
			id: joi.string().uuid(),
		}).required();
	}
}

export const userGetSchema = new UserGetSchema()