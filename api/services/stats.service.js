class StatsService {
	stats = {
		totalUsers: 3,
		totalBets: 1,
		totalEvents: 1,
	};

	getStats() {
		return this.stats;
	}

	incrementUsers() {
		this.stats.totalUsers++;
	}

	incrementBets() {
		this.stats.totalBets++;
	}

	incrementEvents() {
		this.stats.totalEvents++;
	}
}

export const statsService = new StatsService();