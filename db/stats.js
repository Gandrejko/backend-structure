class Stats {
	constructor() {
		this.stats = {
			totalUsers: 3,
			totalBets: 1,
			totalEvents: 1,
		}
	}

	getStats() {
		return this.stats;
	}

	setTotalUser(number) {
		return this.stats.totalUsers + number;
	}

	setTotalBets(number) {
		return this.stats.totalBets + number;
	}

	setTotalEvents(number) {
		return this.stats.totalEvents + number;
	}

}

export const stats = new Stats()