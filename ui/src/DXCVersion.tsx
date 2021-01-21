import React from "react";
import { LOCAL_HOST } from "./fetchers";
import axios from "axios";
import {
  Grid,
  Typography,
} from "@material-ui/core";
import {
  Error,
} from "@material-ui/icons";

interface IAuth {
  ID?: string;
  version: string;
  checked: string;
  upgrade: boolean;
  latest: string;
  alreadyRequestedData: boolean;
}

export const DXCVersion = () => {

  const [body, setBody] = React.useState<IAuth>({
    version: "N/A",
    checked: "N/A",
    upgrade: false,
    latest: "N/A",
    alreadyRequestedData: false,
  });

  const [err, setErr] = React.useState<string>("");

  const getData = async () => {
    axios
      .get(`${LOCAL_HOST}/user/versioninfo`, {
        headers: { 'DXC_SECURE_KEY': localStorage.getItem('DXC_SECURE_KEY') }
      })
      .then(data => {
        setBody({
          version: data.data.version,
          checked: data.data.checked,
          upgrade: data.data.upgrade,
          latest: data.data.latest,
          alreadyRequestedData: true,
        });
      })
      .catch(error => {
        setErr("Network Error")
      });
  };

  if (!body.alreadyRequestedData) {
    getData();
  }

  if(err !== ""){
    return (
      <Grid container>
      <div style={{ display: "flex", alignContent: "row", alignItems: "center", width: "100%" }}>
          <Error color="error"/>
          <p style={{ marginLeft: "1%", color: "red" }}>
            Unable to fetch data. Please check if server is running [<b> {err} </b>]
          </p>
        </div>
      </Grid>
    )
  }
  return (
    <Grid
      container
      spacing={2}
      style={{
        marginTop: "1%",
        flexGrow: 1,
        alignItems: "normal",
      }}
      direction="column"
    >
      <Grid item>
        <Typography variant="h4" component="h2" color="textSecondary">
          {body?.version}
        </Typography>
        <Typography variant="subtitle1" component="h2" color="textSecondary">
          Installed on : {body?.checked}
        </Typography>
        {body?.upgrade?
        <Typography variant="h6" component="h2" color="secondary">
          New version {body?.latest} available. Please upgrade and restart the DXC. 
        </Typography>
        :
        <Typography variant="h6" component="h2" color="primary">
          Latest version 
        </Typography>
        }
      </Grid>
    </Grid>
  );
};