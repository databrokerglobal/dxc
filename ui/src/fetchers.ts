import axios from "axios";

export const LOCAL_HOST = `${window.DXC_SERVER_HOST || "http://localhost:8080"}`;

export const fetcher = (ROUTE: string) => axios(`${LOCAL_HOST}${ROUTE}`);
