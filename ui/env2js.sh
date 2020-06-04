#!/bin/sh

# used to set variable from docker-compose env variables

if [ ! -z ${DXC_SERVER_HOST} ]; then
 cat <<END
 window.DXC_SERVER_HOST="${DXC_SERVER_HOST}";
END
fi