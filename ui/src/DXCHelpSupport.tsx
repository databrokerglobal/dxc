import React from "react";
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@material-ui/core";
import SettingsIcon from '@material-ui/icons/Settings';
import EmailIcon from '@material-ui/icons/Email';
import LinkIcon from '@material-ui/icons/Link';
import LabelIcon from '@material-ui/icons/Label';
import { useWindowSize } from "./WindowSizeHook";

export const DXCHelpSupport = () => {

const [width] = useWindowSize();

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
      <Typography variant="subtitle1" >
        Help &amp; Support
      </Typography>
      <div>
        <List style={{width: "100%"}} >
            <ListItem>
              <ListItemAvatar>
                <LabelIcon style={{fill: "#3DEFC5"}} />
              </ListItemAvatar>
              <ListItemText>
                The Data eXchange Controller (DXC) is a small piece of software that has extremely low CPU and memory requirements and can be installed on any server or small devices such as routers, PLCs etc.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                  <LabelIcon style={{fill: "#3DEFC5"}} />
              </ListItemAvatar>
              <ListItemText>
                Its role is twofold, it enables data sellers to map the actual data files or content on DataBroker’s authentication and data mapping servers, and at the same time, it acts as a secure switch, allowing peer to peer access to the buyers who establish proof of purchase and deal validity.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemAvatar>                
                  <LabelIcon style={{fill: "#3DEFC5"}} />               
              </ListItemAvatar>
              <ListItemText>
                DXC supports Files, API connections and Data Streams and can be installed via docker or by using executable binaries. It continuously syncs with DataBroker’s platform on one hand and on the other hand it regularly checks the existence of the mapped data content and returns the data availability status.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemAvatar>               
                  <SettingsIcon style={{fill: "#3DEFC5"}} />              
              </ListItemAvatar>
              <ListItemText>
                For detailed documentation on installing, authenticating, and configuring the DXC please refer the documentation on the Databroker website.
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemAvatar>                
                  <LinkIcon style={{fill: "#3DEFC5"}} />              
              </ListItemAvatar>
              <ListItemText>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="http://www.databroker.global/documentation/dxc"
                >
                  www.databroker.global/documentation/dxc
                </a>
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemAvatar>                
                  <EmailIcon style={{fill: "#3DEFC5"}}/>                
              </ListItemAvatar>
              <ListItemText>
                For further help, write to us at&nbsp; 
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="mailto://support@databroker.global"
                >
                  support@databroker.global
                </a>
              </ListItemText>
            </ListItem>
        </List>
      </div>
    </Grid>
  );
};