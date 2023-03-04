import {userRoutes} from "./user.routes.js";

export const routes = (app) => {
	app.use('/users', userRoutes);
};