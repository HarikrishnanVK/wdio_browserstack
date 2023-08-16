import { configure, getLogger } from "log4js";

configure ("./log4js.json");

export const logger = getLogger ();