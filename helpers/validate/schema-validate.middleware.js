export const schemaValidate = (schema, body) => {
	const isValidResult = schema.getSchema().validate(body);

	if (isValidResult.error) {
		return {isValid: false, errorMessage: isValidResult.error.details[0].message}
	}

	return {isValid: true, errorMessage: null};
}