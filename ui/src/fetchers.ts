import axios from "axios";

const LOCAL_PORT = 8080;
export const LOCAL_HOST = `${window.DXC_SERVER_HOST || "http://localhost"}:${LOCAL_PORT}`;

export const fetcher = (ROUTE: string) => axios(`${LOCAL_HOST}${ROUTE}`);
