import {schemaValidate} from "../../helpers/validate/schema-validate.middleware.js";
import {betPostSchema} from "../../db/schemas/bet/betPostSchema.js";

const betValidate = (req, res, next) => {
	const {isValid, errorMessage} = schemaValidate(betPostSchema, req.body);

	if (!isValid) {
		res.status(400).error = errorMessage;
	}

	next();
}

export {betValidate}