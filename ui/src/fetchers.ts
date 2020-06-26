import axios from "axios";

export let LOCAL_HOST = "";
if (typeof (window.DXC_SERVER_HOST) !== "undefined") {
  LOCAL_HOST = window.DXC_SERVER_HOST;
} else {
  LOCAL_HOST = "http://localhost:8080";
}

export const fetcher = (ROUTE: string) => axios(`${LOCAL_HOST}${ROUTE}`);
