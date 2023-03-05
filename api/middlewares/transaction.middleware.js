import {schemaValidate} from "../../helpers/validate/schema-validate.middleware.js";
import {transactionPostSchema} from "../../db/schemas/transaction/transactionPostSchema.js";

export const transactionValidate = (req, res, next) => {
	const {isValid, errorMessage} = schemaValidate(transactionPostSchema, req.body);

	if (!isValid) {
		res.status(400).error = errorMessage;
	}

	next();
}