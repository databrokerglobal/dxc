#!/bin/bash
set -e
IFS=

# default values
HOST_IP="localhost"
HOST_PORT=1111
LOCAL_FOLDER="/tmp"
PASSWORD=""
IMAGE_TAG="latest"

function createEnv() {

    echo '

    # define IP to be used for accessing UI
    URL_IP='${HOST_IP}'

    # define port number to be used for accessing UI
    PORT='${HOST_PORT}'

    # define environment, if set to local then it will be dev and each datasources will be checked and sync at every restart
    GO_ENV=docker

    # define INFURA_ID
    INFURA_ID=1d27961a0ea644ae824620ccfab9c9fa

    # define local files for sharing local files as datasources
    LOCAL_FILES_DIR='${LOCAL_FOLDER}'

    # if it is set to 1 then server will halt if no internet is available on host machine
    HALT_ON_NO_INTERNET=0

    # if it is set to 1 then server will halt if new DXC version is  available (need to click version info tab before this)
    HALT_ON_UPGRADE_AVAILABLE=0

    # if it is set to 1 then it will ignore HALT_ON_UPGRADE_AVAILABLE and continue installation of current version
    FORCE_UPGRADE=0

    ## key to secure your DXC server. Choose whatever key you want, you will have to enter it to use the DXC api or the DXC ui. Comment or leave empty to not use a secure key. Choose a long key for maximum security.
    #DXC_SECURE_KEY='${PASSWORD}'

    # ------------------------------------
    # DO NOT EDIT ANY VARIBALE AFTER THIS 
    # ------------------------------------

    ## DXC IP/URL for access from outside. include http/https and port. no trailing slash
    DXC_HOST=http://${URL_IP}:${PORT}2

    ## DXC IP for access from ui to server. localhost does not work if you use docker. include http/https and port (that you set in docker-compose).
    DXC_SERVER_HOST=http://${URL_IP}:${PORT}2

    ## if use mqtt:
    #MQTT_BROKER_HOST=broker.emqx.io

    ' > .env

    echo ">>>>>>    created .env  "
}

function createDockerCompose(){
echo 'version: "3"

services:
    dxc-server:
        image: databrokerdao/dxc-server:'${IMAGE_TAG}'
        volumes:
            - ./db-data:/go/db-data
            - ${LOCAL_FILES_DIR}:${LOCAL_FILES_DIR}
        ports:
            - "${PORT}2:8080"
        env_file:
            - .env
    dxc-ui:
        image: databrokerdao/dxc-ui:'${IMAGE_TAG}'
        ports:
            - "${PORT}:80"
        env_file:
            - .env
    
    '  > docker-compose.yml

    echo ">>>>>>    created docker-compose.yml  "
}

FILE=.env #docker-compose.yml is dependent on .env only
    
echo ""
echo "##########################   DXC  Setup  ##########################"
echo ""
echo "Press RETURN to install OR any other key to just restart"
read -s -n 1 VAR
if [ "$VAR" = "" ]; 
then
    echo "Installation ..."
    if test -f "$FILE"; 
    then
        #echo "$FILE exists."
        echo "** Previous installation found **"
        echo "Press RETURN to remove previous and setup new OR press any other key to abort"
        read -s -n 1 VAR
        if [ "$VAR" = "" ]; 
        then
            rm .env
            if test -f "docker-compose.yml"; 
            then
                rm docker-compose.yml
            fi    
            echo "Removed previous setup files : .env and docker-compose.yml "
        else
            echo "#### Aborting as requested..."
            echo ""
            exit 1
        fi
    fi

    # get IP  
    echo -n "Please provide IP : "
    read TEMP_VAR
    if [ "$TEMP_VAR" != "" ]; then
        HOST_IP=$TEMP_VAR
    fi
        
    # get PORT
    echo -n "Please provide PORT : "
    read TEMP_VAR
    if [ "$TEMP_VAR" != "" ]; then
        HOST_PORT=$TEMP_VAR
    fi

    # get PORT
    echo -n "Please provide local folder for datasources files : "
    read TEMP_VAR
    if [ "$TEMP_VAR" != "" ]; then
        LOCAL_FOLDER=$TEMP_VAR
    fi

    # get PORT
    echo -n "Please provide password : "
    read TEMP_VAR
    if [ "$TEMP_VAR" != "" ]; then
        PASSWORD=$TEMP_VAR
    fi
    
    # create setup files .env and docker-compose.yml
    createEnv
    createDockerCompose
else
    if test -f "$FILE";
    then  
        echo "Press RETURN to pull latest image OR press any other key to further provide new image tag to pull from docker"
        read -s -n 1 VAR
        if [ "$VAR" = "" ]; 
        then
            echo "Pull latest image ..."
        else
            # get IMAGE TAG
            echo ""
            echo -n "Please provide image tag to pull : "
            read TEMP_VAR
            if [ "$TEMP_VAR" != "" ]; then
                IMAGE_TAG=$TEMP_VAR
                if test -f "docker-compose.yml"; 
                then
                    rm docker-compose.yml
                fi    
                echo "Removed previous docker-compose.yml "
            else
                echo "Pulling 'latest' image tag as no new tag specified"    
            fi
        fi
        createDockerCompose
        echo ""
        echo "Restarting ..."    
    else
        echo ""
        echo "#### Aborting. No .env or docker-compose.yml files found. Please re-run this setup scriopt to install DXC ..."
        echo ""
        exit 1
    fi    
fi

echo "docker-compose down"
docker-compose down 
echo "docker-compose pull"
docker-compose pull
echo "docker-compose up -d"
docker-compose up -d
echo ""
echo "Completed !!!!"
    

