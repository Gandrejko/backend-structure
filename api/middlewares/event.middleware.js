import {schemaValidate} from "../../helpers/validate/schema-validate.middleware.js";
import {eventPostSchema} from "../../db/schemas/event/eventPostSchema.js";

const eventValidate = (req, res, next) => {
	const {isValid, errorMessage} = schemaValidate(eventPostSchema, req.body);

	if (!isValid) {
		res.status(400).error = errorMessage;
	}

	next();
}

export {eventValidate}