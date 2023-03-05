import {userRoutes} from "./user.routes.js";
import {transactionRoutes} from "./transaction.routes.js";

export const routes = (app) => {
	app.use('/users', userRoutes);
	app.use('/transactions', transactionRoutes);
};