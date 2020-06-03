import axios from "axios";

const LOCAL_PORT = 8080;
export const LOCAL_HOST = `http://127.0.0.1:${LOCAL_PORT}`;

export const fetcher = (ROUTE: string) => axios(`${LOCAL_HOST}${ROUTE}`);
