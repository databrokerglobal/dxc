import React from "react";
import axios from "axios";
import dayjs from "dayjs";
import { LOCAL_HOST, fetcher } from "./fetchers";
import useSWR, {mutate} from "swr";
import {
  Error,
  Check,
} from "@material-ui/icons";
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
} from "@material-ui/core";
import { isEmptyArray } from "formik";
import { useWindowSize } from "./WindowSizeHook";
import * as Yup from "yup";
import * as R from "ramda";

interface IDatasource {
  ID?: string;
  name: string;
  type: string;
  did?: string;
  host: string;
  headerAPIKeyName: string;
  headerAPIKeyValue: string;
}

export const DatasourceForm = () => {
  const exampleBody = {
    name: "datasource xxx",
    host: "http://example.com/myfile",
    type: "API",
    headerAPIKeyName: "",
    headerAPIKeyValue: "",
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

  const handleSubmit = async () => {
    try {
      await axios.post(`${LOCAL_HOST}/datasource`, body, {
        headers: { 'DXC_SECURE_KEY': localStorage.getItem('DXC_SECURE_KEY')}
      });
      setResp(`Success. Datasource created.`);
      mutate('/datasources')
    } catch (error) {
      setErr(error.toString());
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
        />
      </Grid>
      <Grid item>
        <TextField
          required
          id="type"
          select
          label="Type"
          helperText="The name of data source"
          value={body?.type}
          onChange={handleType}
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
      <Grid item>
        <TextField
          required
          error={body?.host?.length === 0}
          id="host"
          label="Host"
          helperText="The host (url) of the data source"
          value={body?.host}
          onChange={handleHost}
        />
      </Grid>
      {body.type === "API" ?
        <Grid item xs={2}>
          <TextField
            id="headerAPIKeyName"
            label="API Key Name"
            helperText="Optional key required in the headers"
            value={body?.headerAPIKeyName}
            onChange={handleHeaderAPIKeyName}
          />
        </Grid> : null
      }
      {body.type === "API" ?
        <Grid item xs={2}>
          <TextField
            id="headerAPIKeyValue"
            label="API Key Value"
            helperText=""
            value={body?.headerAPIKeyValue}
            onChange={handleHeaderAPIKeyValue}
          />
        </Grid> : null
      }
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
            <p style={{ marginLeft: "1%", color: "red" }}>{err}</p>
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
  };
  const [body, setBody] = React.useState<IDatasource>(exampleBody);
  const [resp, setResp] = React.useState<string>("");
  const [err, setErr] = React.useState<string>("");
  
  const handleDelete = async (name : string)  => {
    if (window.confirm('Are you sure you want to delete (unrecoverable) this datasource from the database ?')) {
      try {
        await axios.delete(`${LOCAL_HOST}/datasource/${name}`, {
          headers: { 'DXC_SECURE_KEY': localStorage.getItem('DXC_SECURE_KEY')}
        });
        setResp(`Success. Datasource deleted.`);
        mutate('/datasources')
      } catch (error) {
        setErr(error.toString());
      }
      return;
    } else {
        return false;
    }
  }

  const handleEdit = async (ds: any)  => {
    if (window.confirm('** Are you sure you want to edit this datasource ?')) {
      var nameds = prompt("Please provide new NAME of the data source", ds.name);
      if (nameds != null && nameds.trim()!="" ) {
        var urlds = prompt("Please provide new HOST URL of the data source", ds.host);
        if (urlds != null && urlds.trim()!="" ) {
          // check if there is no edit 
          if(nameds==ds.name && urlds==ds.host){
            alert("Aborting as neither NAME or HOST URL was edited");
          } else {
            // set body 
            body.name=nameds;
            body.host=urlds;
            body.type=ds.type;
            body.headerAPIKeyName=ds.headerAPIKeyName;
            body.headerAPIKeyValue=ds.headerAPIKeyValue;
            try {
              // now update previous
              await axios.put(`${LOCAL_HOST}/datasource/${ds.did}`, body, {
                headers: { 'DXC_SECURE_KEY': localStorage.getItem('DXC_SECURE_KEY')}
              });
              setResp(`Success. Datasource updated.`);
              mutate('/datasources')
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
  }

  return (
    <Grid container spacing={2}>
      {!error &&
        data && (
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Added on</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Key in headers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data.data as any).map((datasource: any) => (
                datasource.did !== "" ?
                  <TableRow key={datasource.did}>
                    <TableCell>{datasource.name}</TableCell>
                    <TableCell>{datasource.type}</TableCell>
                    <TableCell>{datasource.host}</TableCell>
                    <TableCell>{dayjs(datasource.CreatedAt).format('YYYY-MM-DD')}</TableCell>
                    <TableCell component="th" scope="row">{datasource.did}</TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={e => handleEdit(datasource)}>Edit</Button>&nbsp;&nbsp;&nbsp;
                      <Button variant="contained" onClick={e => handleDelete(datasource.did)}>Delete</Button>  
                    </TableCell>
                    <TableCell style={{whiteSpace: "nowrap"}}>{datasource.headerAPIKeyName}{datasource.headerAPIKeyName !== undefined && datasource.headerAPIKeyName !== "" ? ":":""} {datasource.headerAPIKeyValue}</TableCell>
                  </TableRow> : null
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
