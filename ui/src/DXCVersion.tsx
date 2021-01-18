import React from "react";
import { LOCAL_HOST } from "./fetchers";
import axios from "axios";
import {
  Grid,
  Typography,
} from "@material-ui/core";
import * as R from "ramda";

interface IAuth {
  ID?: string;
  version: string;
  checked: string;
  upgrade: boolean;
  alreadyRequestedData: boolean;
}

export const DXCVersion = () => {

  const [body, setBody] = React.useState<IAuth>({
    version: "N/A",
    checked: "N/A",
    upgrade: false,
    alreadyRequestedData: false,
  });

  const [resp, setResp] = React.useState<string>("");
  const [err, setErr] = React.useState<string>("");

  // reset error or response + form
  React.useEffect(() => {
    if (!R.isEmpty(err)) {
      setTimeout(() => {
        setErr("");
      }, 2000);
    }
    if (!R.isEmpty(resp)) {
      setTimeout(() => {
        setResp("");
      }, 2000);
    }
  });


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
          alreadyRequestedData: true,
        });
      })
      .catch(err => {
        console.log(err);
        return null;
      });
  };

  if (!body.alreadyRequestedData) {
    getData();
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
        <Typography variant="h6" component="h2" color="secondary">
          {body?.upgrade?"New version available. Please upgrade the software.":""}
        </Typography>
      </Grid>
    </Grid>
  );
};