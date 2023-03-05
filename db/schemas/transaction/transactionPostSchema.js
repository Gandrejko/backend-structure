import {Schema} from "../schema.js";
import joi from 'joi';

class TransactionPostSchema extends Schema {
	constructor(data) {
		super();
		this.data = data;
		this.schema = joi.object({
			id: joi.string().uuid(),
			userId: joi.string().uuid().required(),
			cardNumber: joi.string().required(),
			amount: joi.number().min(0).required(),
		}).required();
	}
}

export const transactionPostSchema = new TransactionPostSchema()