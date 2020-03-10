import axios from "axios";

const LOCAL_PORT = 1323;
export const LOCAL_HOST = `http://localhost:${LOCAL_PORT}`;

export const fetcher = (ROUTE: string) => axios(`${LOCAL_HOST}${ROUTE}`);
