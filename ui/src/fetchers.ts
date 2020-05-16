import axios from "axios";

const LOCAL_PORT = 8080;
export const LOCAL_HOST = `http://${process.env.REACT_APP_DXC_HOST || "localhost"}:${LOCAL_PORT}`;

export const fetcher = (ROUTE: string) => axios(`${LOCAL_HOST}${ROUTE}`);
