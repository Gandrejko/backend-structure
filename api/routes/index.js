import {userRoutes} from "./user.routes.js";
import {transactionRoutes} from "./transaction.routes.js";
import {eventRoutes} from "./event.routes.js";
import {betRoutes} from "./bet.routes.js";

export const routes = (app) => {
	app.use('/users', userRoutes);
	app.use('/transactions', transactionRoutes);
	app.use('/events', eventRoutes);
	app.use('/bets', betRoutes);
};