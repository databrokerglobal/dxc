import React from "react";
// import { fetcher, LOCAL_HOST } from "./fetchers";
// import useSWR from "swr";
// import axios from "axios";
import {
  Button,
  TextField,
  Grid,
} from "@material-ui/core";
import {
  Error,
  Check,
} from "@material-ui/icons";
import * as R from "ramda";
import * as Yup from "yup";

export interface IFile {
  ID?: string;
  name: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  ProductID?: number;
}

interface IAuth {
  ID?: string;
  address: string;
  apiKey: string;
}

export const Authentication = () => {
  const [body, setBody] = React.useState<IAuth>({
    address: "0x2f112ad225E011f067b2E456532918E6D679F978",
    apiKey: "cb6075edfcdc003565bc7a6c",
  });
  const [resp] = React.useState<string>("");
  const [err] = React.useState<string>("");

  const schema = Yup.object().shape({
    address: Yup.string().required(),
    apiKey: Yup.string().required(),
  });

  const handleSave = async () => {
    console.log(body);
    // try {
    //   await axios.post(`${LOCAL_HOST}/product`, body);
    //   setResp(`Success. Product created.`);
    // } catch (error) {
    //   setErr(error.toString());
    // }
  };

  const handleAddress = (event: any) => {
    setBody(R.assoc("address", event.target.value, body));
  };

  const handleApiKey = (event: any) => {
    setBody(R.assoc("apiKey", event.target.value, body));
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
      direction="column"
    >
      <Grid item>
        <TextField
          error={body?.address?.length === 0}
          required
          id="address"
          label="Address"
          helperText="This is the address of your seller account in the CMS"
          value={body?.address}
          onChange={handleAddress}
        />
      </Grid>
      <Grid item>
        <TextField
          error={body?.apiKey?.length === 0}
          required
          id="apiKey"
          label="API Key"
          helperText="This API key is available on your seller account in the CMS"
          value={body?.apiKey}
          onChange={handleApiKey}
        />
      </Grid>
      <Grid item xs={12}>
        {R.isEmpty(err) && R.isEmpty(resp) && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!schema.isValidSync(body)}
          >
            Save
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