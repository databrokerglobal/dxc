import React from "react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
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

  dayjs.extend(localizedFormat);
  dayjs.extend(relativeTime);

  const statusColor = (success: boolean): string => {
    return success ? "green" : "red";
  };

  return (
    <Grid container spacing={2}>
      {!error &&
        data && (
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '15%' }}>When</TableCell>
                <TableCell style={{ width: '12%' }}>Status</TableCell>
                <TableCell style={{ width: '53%' }}>Error Message</TableCell>
                <TableCell style={{ width: '20%' }}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data.data as any).map((syncStatus: any) => (
                <TableRow key={syncStatus.ID}>
                  <TableCell>{dayjs(syncStatus.CreatedAt).fromNow()}</TableCell>
                  <TableCell style={{ color: statusColor(syncStatus.success), }}>{syncStatus.success ? "Sync OK" : "Sync Error"}</TableCell>
                  <TableCell>{syncStatus.success ? "" : syncStatus.errorResp}</TableCell>
                  <TableCell>{dayjs(syncStatus.CreatedAt).format('L LT')}</TableCell>
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
