class Schema {
	constructor(data) {
		this.data = data;
		this.schema = null;
	}

	getSchema() {
		return this.schema;
	}

	validate() {
		return this.schema.validate(this.data);
	}
}

export {Schema}
