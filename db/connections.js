import knex from "knex";
import {dbConfig} from '../config/db.config.knex.js';

export const database = knex(dbConfig.development);