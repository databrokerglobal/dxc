import React from "react";
import { LOCAL_HOST } from "./fetchers";
import axios from "axios";
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button
} from "@material-ui/core";
import {
  Error,
} from "@material-ui/icons";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import LabelImportantIcon from '@material-ui/icons/LabelImportant';          

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
  const [showhistory, setShowHistory] = React.useState<boolean>(false);
  const [history, setHistory] = React.useState<IAuth[]>([]);

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
        setErr(error.message)
      });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(!event.target.checked){
      setHistory([])
      setShowHistory(false)
    } else {
      axios
        .get(`${LOCAL_HOST}/user/versionhistory`, {
          headers: { 'DXC_SECURE_KEY': localStorage.getItem('DXC_SECURE_KEY') }
        })
        .then(data => {
          setHistory(data.data)
          setShowHistory(true)
        })
        .catch(error => {
          setErr(error.message)
        });
      }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete (unrecoverable) all previous version history from the database ?"
      )
    ) {
      try {
        await axios.delete(`${LOCAL_HOST}/user/versionhistory`, {
          headers: { DXC_SECURE_KEY: localStorage.getItem("DXC_SECURE_KEY") },
        });
        setHistory([])
        setShowHistory(false)
      } catch (error) {
        setErr(error.toString());
      }
      return;
    } else {
      return false;
    }
  };

  if (!body.alreadyRequestedData) {
    getData();
  }

  if(err !== ""){
    return (
      <Grid container>
      <div style={{ display: "flex", alignContent: "row", alignItems: "center", width: "100%" }}>
          <Error color="error"/>
          <p style={{ marginLeft: "1%", color: "#FF3B3B" }}>
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
        <Typography variant="h6" component="h2" color="primary">
          {body.latest==="FORCED"?"You have installed other version than latest. Remove FORCE_UPGRADE variable from .env file to upgrade latest version":"New version "+ body.latest +" available. Please upgrade and restart the DXC"} 
        </Typography>
        :
        <Typography variant="h6" component="h2" color="primary">
          Latest version 
        </Typography>
        }
        <FormControlLabel
          control={
            <Switch
              onChange={handleChange}
              name="checkedB"
              color="primary"
            />
          }
          label="Show history"
        />  
        {showhistory && history && history.filter(x => x.checked !== body.checked).length <= 0 && (
          <div
            style={{ display: "flex", alignContent: "row", alignItems: "center", width: "100%" }}
          >
            <Error color="error"/>
            <p style={{ marginLeft: "1%", color: "#FF3B3B" }}>
               No previous installation history found [Fresh installation]
            </p>
          </div>
        )}
        {showhistory && history && history.filter(x => x.checked !== body.checked).length > 0 && (
          <Grid item style={{marginTop: "2%"}}>
            <Typography variant="h6" >
               Total {history.filter(x => x.checked !== body.checked).length} previous versions (upgrades) found
            </Typography>
            {(history.filter(x => x.checked !== body.checked) as any).reverse().map((item: any) =>
              <div>
              <List style={{width: "100%"}} >
                  <ListItem>
                    <ListItemAvatar>
                      <LabelImportantIcon style={{fill: "#3DEFC5"}} />
                    </ListItemAvatar>
                    <ListItemText>
                      <Typography variant="h6" component="h2" color="textSecondary">
                        {item?.version}
                      </Typography>
                      <Typography variant="subtitle1" component="h2" color="textSecondary">
                        Installed on : {item?.checked}
                      </Typography>
                      <Typography variant="subtitle1" component="h2" color="textSecondary">
                        {item?.latest}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                </List>
              </div>
            )}
            <Button
                style={{
                  marginLeft: 10,
                  backgroundColor: "#FF3B3B",
                  color: "white",
                }}
                variant="contained"
                onClick={(e) => handleDelete()}
              >
              Delete all history
            </Button>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};