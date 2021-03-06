import React from "react";
import axios from "axios";
import dayjs from "dayjs";
import { LOCAL_HOST, fetcher } from "./fetchers";
import useSWR, { mutate } from "swr";
import { Error, Check } from "@material-ui/icons";
import {
  TextField,
  MenuItem,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
  Box,
} from "@material-ui/core";
import { isEmptyArray } from "formik";
import { useWindowSize } from "./WindowSizeHook";
import * as Yup from "yup";
import * as R from "ramda";
import LensIcon from '@material-ui/icons/Lens';

interface IDatasource {
  ID?: string;
  name: string;
  type: string;
  did?: string;
  host: string;
  headerAPIKeyName: string;
  headerAPIKeyValue: string;
  protocol: string;
  ftpusername: string;
  ftppassword: string;
}

export const DatasourceForm = () => {
  const exampleBody = {
    name: "datasource example",
    host: "http://example.com/myfile",
    type: "API",
    headerAPIKeyName: "",
    headerAPIKeyValue: "",
    protocol: "HTTP",
    ftpusername: "anonymous",
    ftppassword: "anonymous",
  };
  const [body, setBody] = React.useState<IDatasource>(exampleBody);
  const [resp, setResp] = React.useState<string>("");
  const [err, setErr] = React.useState<string>("");
  const [width] = useWindowSize();

  // reset error or response + form
  React.useEffect(() => {
    if (!R.isEmpty(err)) {
      setTimeout(() => {
        setErr("");
        setBody(exampleBody);
      }, 2000);
    }
    if (!R.isEmpty(resp)) {
      setTimeout(() => {
        setResp("");
        setBody(exampleBody);
      }, 2000);
    }
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    type: Yup.string().required(),
    host: Yup.string().required(),
  });

  const handleType = (event: any) => {
    setBody(R.assoc("type", event.target.value, body));
  };

  const handleName = (event: any) => {
    setBody(R.assoc("name", event.target.value, body));
  };

  const handleHost = (event: any) => {
    setBody(R.assoc("host", event.target.value, body));
  };

  const handleHeaderAPIKeyName = (event: any) => {
    setBody(R.assoc("headerAPIKeyName", event.target.value, body));
  };

  const handleHeaderAPIKeyValue = (event: any) => {
    setBody(R.assoc("headerAPIKeyValue", event.target.value, body));
  };

  const handleProtocol = (event: any) => {
    setBody(R.assoc("protocol", event.target.value, body));
  };

  const handleFtpusername = (event: any) => {
    setBody(R.assoc("ftpusername", event.target.value, body));
  };

  const handleFtppassword = (event: any) => {
    setBody(R.assoc("ftppassword", event.target.value, body));
  };

  const handleSubmit = async () => {
    // premlims checking
    if (body.type === "FILE") {
      if (body.protocol === "HTTP") {
        if (body.host.toLowerCase().startsWith("http://")) {
          //alert("Correct HTTP host");
        } else {
          alert(
            "Wrong PROTOCOL and HOST URL\n\n HTTP URL must start with http:// "
          );
          return;
        }
      } else if (body.protocol === "HTTPS") {
        if (body.host.toLowerCase().startsWith("https://")) {
          //alert("Correct HTTPS host");
        } else {
          alert(
            "Wrong PROTOCOL and HOST URL\n\n HTTPS URL must start with https:// "
          );
          return;
        }
      } else if (body.protocol === "FTP") {
        if (body.host.toLowerCase().startsWith("ftp://")) {
          //alert("Correct FTP host");
        } else {
          alert(
            "Wrong PROTOCOL and HOST URL\n\n FTP URL must start with ftp:// "
          );
          return;
        }
      } else if (body.protocol === "FTPS") {
        if (body.host.toLowerCase().startsWith("ftps://")) {
          //alert("Correct FTPS host");
        } else {
          alert(
            "Wrong PROTOCOL and HOST URL\n\n FTPS URL must start with ftps:// "
          );
          return;
        }
      } else if (body.protocol === "SFTP") {
        if (body.host.toLowerCase().startsWith("sftp://")) {
          //alert("Correct SFTP host");
        } else {
          alert(
            "Wrong PROTOCOL and HOST URL\n\n SFTP URL must start with sftp:// "
          );
          return;
        }
      } else if (body.protocol === "LOCAL") {
        if (
          body.host.toLowerCase().startsWith("file://") ||
          body.host.toLowerCase().startsWith("/")
        ) {
          //alert("Correct LOCAL file host");
        } else {
          alert(
            "Wrong PROTOCOL and HOST URL\n\n Local file URI must start with file:// or /"
          );
          return;
        }
      } else {
        alert("Wrong PROTOCOL and HOST URL.");
        return;
      }
    }

    if (window.confirm("Are you sure you want to ADD a new datasource ?")) {
      try {
        await axios.post(`${LOCAL_HOST}/datasource`, body, {
          headers: { DXC_SECURE_KEY: localStorage.getItem("DXC_SECURE_KEY") },
        });
        setResp(`Success. Datasource created.`);
        mutate("/datasources");
      } catch (error) {
        setErr(error.toString());
      }
    }
  };

  return (
    <Grid
      container
      spacing={2}
      style={{
        marginTop: "1%",
        flexGrow: 1,
        alignItems: "normal",
      }}
      direction={width < 590 ? "column" : "row"}
    >
      <Grid item>
        <TextField
          error={body?.name?.length === 0}
          required
          id="name"
          label="Name"
          helperText="The name of the data source"
          value={body?.name}
          onChange={handleName}
          fullWidth
        />
      </Grid>
      <Grid item>
        <TextField
          required
          id="type"
          select
          label="Type"
          helperText="The type of data source"
          value={body?.type}
          onChange={handleType}
          fullWidth
        >
          {[
            { value: "API", label: "API" },
            { value: "FILE", label: "File" },
            { value: "STREAM", label: "Stream" },
          ].map((o: any, i: number) => (
            <MenuItem key={i.toString()} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      {body.type === "FILE" ? (
        <Grid item>
          <TextField
            id="protocol"
            select
            label="Protocol"
            helperText="Access protocol for file"
            value={body?.protocol}
            onChange={handleProtocol}
            fullWidth
          >
            {[
              { value: "HTTP", label: "http" },
              { value: "HTTPS", label: "https" },
              { value: "FTP", label: "ftp" },
              { value: "FTPS", label: "ftps" },
              { value: "SFTP", label: "sftp" },
              { value: "LOCAL", label: "local" },
            ].map((o: any, i: number) => (
              <MenuItem key={i.toString()} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      ) : null}
      <Grid item xs={2}>
        <TextField
          required
          error={body?.host?.length === 0}
          id="host"
          label="Host"
          helperText="The host (url) of the data source"
          value={body?.host}
          onChange={handleHost}
          fullWidth
        />
      </Grid>

      {body.type === "API" ? (
        <Grid item xs={2}>
          <TextField
            id="headerAPIKeyName"
            label="API Key Name"
            helperText="Optional key in the header"
            value={body?.headerAPIKeyName}
            onChange={handleHeaderAPIKeyName}
          />
        </Grid>
      ) : null}
      {body.type === "API" ? (
        <Grid item xs={2}>
          <TextField
            id="headerAPIKeyValue"
            label="API Key Value"
            helperText="The value of key"
            value={body?.headerAPIKeyValue}
            onChange={handleHeaderAPIKeyValue}
          />
        </Grid>
      ) : null}
      {body.type === "FILE" &&
      (body.protocol === "FTP" ||
        body.protocol === "FTPS" ||
        body.protocol === "SFTP") ? (
        <Grid item xs={2}>
          <TextField
            id="ftpusername"
            label="Username"
            helperText="Username of FTP server"
            value={body?.ftpusername}
            onChange={handleFtpusername}
          />
        </Grid>
      ) : null}
      {body.type === "FILE" &&
      (body.protocol === "FTP" ||
        body.protocol === "FTPS" ||
        body.protocol === "SFTP") ? (
        <Grid item xs={2}>
          <TextField
            id="ftppassword"
            label="Password"
            helperText="Password of FTP server"
            value={body?.ftppassword}
            onChange={handleFtppassword}
          />
        </Grid>
      ) : null}

      <Grid item xs={12}>
        {R.isEmpty(err) && R.isEmpty(resp) && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!schema.isValidSync(body)}
          >
            Add
          </Button>
        )}
        {!R.isEmpty(err) && R.isEmpty(resp) && (
          <div
            style={{
              display: "flex",
              alignContent: "row",
              alignItems: "center",
            }}
          >
            <Error />
            <p style={{ marginLeft: "1%", color: "#FF3B3B" }}>{err}</p>
          </div>
        )}
        {R.isEmpty(err) && !R.isEmpty(resp) && (
          <div
            style={{
              display: "flex",
              alignContent: "row",
              alignItems: "center",
              flexGrow: 2,
            }}
          >
            <Check />
            <p style={{ marginLeft: "2%" }}>{resp}</p>
          </div>
        )}
      </Grid>
    </Grid>
  );
};

export const DatasourcesList = () => {
  const { data, error } = useSWR("/datasources", fetcher);

  const exampleBody = {
    name: "datasource xxx",
    host: "http://example.com/myfile",
    type: "API",
    headerAPIKeyName: "",
    headerAPIKeyValue: "",
    protocol: "",
    ftpusername: "",
    ftppassword: "",
  };
  // eslint-disable-next-line
  const [body, setBody] = React.useState<IDatasource>(exampleBody);
  // eslint-disable-next-line
  const [resp, setResp] = React.useState<string>("");
  // eslint-disable-next-line
  const [err, setErr] = React.useState<string>("");

  const handleDelete = async (name: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete (unrecoverable) this datasource from the database ?"
      )
    ) {
      try {
        await axios.delete(`${LOCAL_HOST}/datasource/${name}`, {
          headers: { DXC_SECURE_KEY: localStorage.getItem("DXC_SECURE_KEY") },
        });
        setResp(`Success. Datasource deleted.`);
        mutate("/datasources");
      } catch (error) {
        setErr(error.toString());
      }
      return;
    } else {
      return false;
    }
  };

  const handleEdit = async (ds: any) => {
    if (window.confirm("Are you sure you want to edit this datasource ?")) {
      var nameds = prompt(
        "Please provide new NAME of the data source",
        ds.name
      );
      if (nameds !== null && nameds.trim() !== "") {
        var urlds = prompt(
          "Please provide new HOST URL of the data source",
          ds.host
        );
        if (urlds !== null && urlds.trim() !== "") {
          // check if there is no edit
          if (nameds === ds.name && urlds === ds.host) {
            alert("Aborting as neither NAME or HOST URL was edited");
          } else {
            // set body
            body.name = nameds;
            body.host = urlds;
            body.type = ds.type;
            body.headerAPIKeyName = ds.headerAPIKeyName;
            body.headerAPIKeyValue = ds.headerAPIKeyValue;
            try {
              // now update previous
              await axios.put(`${LOCAL_HOST}/datasource/${ds.did}`, body, {
                headers: {
                  DXC_SECURE_KEY: localStorage.getItem("DXC_SECURE_KEY"),
                },
              });
              setResp(`Success. Datasource updated.`);
              mutate("/datasources");
            } catch (error) {
              setErr(error.toString());
            }
          }
        } else {
          alert("Aborting as HOST URL not specified");
        }
      } else {
        alert("Aborting as NAME not specified");
      }
      return;
    } else {
      return false;
    }
  };

  if (!error && data && isEmptyArray(data.data)){ 
    return (
      <Typography variant="subtitle1" color="textSecondary" align="left">
        <p>No data source created yet</p>
      </Typography>
    )
  };

  return (
    <Grid container spacing={2}>
      {!error && data && (
        <TableContainer>
          <Typography variant="subtitle1" color="textSecondary" align="right">
            Total {data.data.length} datasources, scroll for further details --&gt;
          </Typography>
          <Divider/>
          <Table
            stickyHeader
            aria-label="simple table"
            style={{ width: "2000px" }}
          >
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Protocol</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>DID</TableCell>
                <TableCell>Added on</TableCell>
                <TableCell>Key in headers</TableCell>
                <TableCell>Credentials</TableCell>
              </TableRow>
            </TableHead>
            <TableBody> 
              {(data.data as any).map((datasource: any) =>
                datasource.did !== "" ? (
                  <TableRow
                    key={datasource.did}
                    className={datasource.available ? "ds_available" : "ds_unavailable"}
                  >
                    <TableCell>
                      {datasource.available ? <LensIcon style={{ color: '#3DEFC5' }} /> : <LensIcon style={{ color: '#FF3B3B' }} /> }
                    </TableCell>
                    <TableCell>{datasource.name}</TableCell>
                    <TableCell>{datasource.host}</TableCell>
                    <TableCell>{datasource.type}</TableCell>
                    <TableCell>{datasource.protocol}</TableCell>
                    <TableCell>
                      <Button
                        style={{
                          backgroundColor: "#3DEFC5",
                          color: "black",
                        }}
                        variant="contained"
                        onClick={(e) => handleEdit(datasource)}
                      >
                        Edit
                      </Button>
                      <Button
                        style={{
                          marginLeft: 10,
                          backgroundColor: "#FF3B3B",
                          color: "white",
                        }}
                        variant="contained"
                        onClick={(e) => handleDelete(datasource.did)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                    <TableCell component="th" scope="row">{datasource.did}</TableCell>
                    <TableCell>
                      {dayjs(datasource.CreatedAt).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {datasource.headerAPIKeyName}
                      {datasource.headerAPIKeyName !== undefined &&
                      datasource.headerAPIKeyName !== ""
                        ? ":"
                        : ""}{" "}
                      {datasource.headerAPIKeyValue}
                    </TableCell>
                    <TableCell>
                      {datasource.protocol === "FTPS" ||
                      datasource.protocol === "FTP" ||
                      datasource.protocol === "SFTP"
                        ? datasource.ftpusername + "/" + datasource.ftppassword
                        : ""}{" "}
                    </TableCell>
                  </TableRow>
                ) : null
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {error && error.toString().length > 0 && (
        <div
          style={{ display: "flex", alignContent: "row", alignItems: "center", width: "100%" }}
        >
          <Error color="error"/>
          <p style={{ marginLeft: "1%", color: "#FF3B3B" }}>
            Unable to fetch data. Please check if server is running [<b> {error.toString().replace("Error: ", "")} </b>]
          </p>
        </div>
      )}
      <Box m={10} /> 
    </Grid>
  );
};
