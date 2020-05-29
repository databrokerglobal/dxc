import React from "react";
import { LOCAL_HOST } from "./fetchers";
import axios from "axios";
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

interface IAuth {
  ID?: string;
  address: string;
  apiKey: string;
  alreadyRequestedData: boolean;
}

export const Authentication = () => {

  const [body, setBody] = React.useState<IAuth>({
    address: "",
    apiKey: "",
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

  const schema = Yup.object().shape({
    address: Yup.string().required(),
    apiKey: Yup.string().required(),
  });

  const getData = async () => {
    axios
      .get(`${LOCAL_HOST}/user/authinfo`)
      .then(data => {
        setBody({
          address: data.data.address,
          apiKey: data.data.api_key,
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

  const handleSave = async () => {
    try {
      await axios.post(`${LOCAL_HOST}/user/authinfo?address=${body.address}&apiKey=${body.apiKey}`);
      setResp(`Authentication data successfully saved.`);
    } catch (error) {
      setErr(error.toString());
    }
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
          label="Account ID"
          fullWidth={true}
          helperText="This is the account ID of your seller account."
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
          fullWidth={true}
          helperText="This API key is displayed on your seller account."
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
            Save & Sync
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