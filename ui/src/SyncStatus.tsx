import React from "react";
import { DateTime } from "luxon";
import { fetcher } from "./fetchers";
import useSWR from "swr";
import {
  Error,
} from "@material-ui/icons";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { isEmptyArray } from "formik";

export const SyncStatusList = () => {
  const { data, error } = useSWR("/syncstatuses/last24h", fetcher);

  const timeFromISOTime = (stringTime: string) => {
    let time = DateTime.fromISO(stringTime);
    return time.toHTTP();
  };

  return (
    <Grid container spacing={2}>
      {!error &&
        data && (
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Error Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data.data as any).map((syncStatus: any) => (
                <TableRow key={syncStatus.ID}>
                  <TableCell>{timeFromISOTime(syncStatus.CreatedAt)}</TableCell>
                  <TableCell>{syncStatus.success ? "OK" : "Sync Error"}</TableCell>
                  <TableCell>{syncStatus.success ? "" : syncStatus.errorResp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      {!error && data && isEmptyArray(data.data) && (
        <p>No data source created yet</p>
      )}
      {error && error.toString().length > 0 && (
        <div
          style={{ display: "flex", alignContent: "row", alignItems: "center" }}
        >
          <Error />
          <p style={{ marginLeft: "1%", color: "red" }}>
            {error.toString().replace("Error: ", "")}
          </p>
        </div>
      )}
    </Grid>
  );
};
