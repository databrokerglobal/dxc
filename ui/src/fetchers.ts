import axios from "axios";

const PORT = 1323;
const HOST = `http://localhost:${PORT}`;

export const fetcher = (ROUTE: string) => axios(`${HOST}${ROUTE}`);
