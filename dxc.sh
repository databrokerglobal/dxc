#!/bin/bash
set -e
IFS=
# set global variables
package=DXC
scriptname=./dxc.sh
FILE=.env #docker-compose.yml is dependent on .env only
# default values
HOST_IP="localhost"
HOST_PORT_DEFAULT=3000
HOST_PORT=3000
SERVER_PORT=3001
LOCAL_FOLDER="/tmp"
PASSWORD=""
IMAGE_TAG="latest"

function checkDocker(){
    if [ -x "$(command -v docker)" ]; then
        if [ -x "$(command -v docker-compose)" ]; then
            echo "#### Good to go, DOCKER and DOCKER-COMPOSE are installed !!!"
        else
            echo ""
            echo "#### Aborting as DOCKER-COMPOSE is not installed ..."
            echo ""
            exit 1
        fi
    else
        echo ""
        echo "#### Aborting as DOCKER not installed ..."
        echo ""
        exit 1
    fi
}

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
    DXC_SECURE_KEY='${PASSWORD}'

    # ------------------------------------
    # DO NOT EDIT ANY VARIBALE AFTER THIS 
    # ------------------------------------

    ## DXC IP/URL for access from outside. include http/https and port. no trailing slash
    DXC_HOST=http://${URL_IP}:'${SERVER_PORT}'

    ## DXC IP for access from ui to server. localhost does not work if you use docker. include http/https and port (that you set in docker-compose).
    DXC_SERVER_HOST=http://${URL_IP}:'${SERVER_PORT}'

    ## if use mqtt:
    #MQTT_BROKER_HOST=broker.emqx.io

    ' > .env

    echo ">>>>>>    created .env  "
}

function createDockerCompose(){
echo 'version: "3"

services:
    dxc-server:
        image: databrokerdao/dxc-server:'$IMAGE_TAG'
        volumes:
            - ./db-data:/go/db-data
            - ${LOCAL_FILES_DIR}:${LOCAL_FILES_DIR}
        ports:
            - "'${SERVER_PORT}':8080"
        env_file:
            - .env
    dxc-ui:
        image: databrokerdao/dxc-ui:'$IMAGE_TAG'
        ports:
            - "'${HOST_PORT}':80"
        env_file:
            - .env
    
    '  > docker-compose.yml

    echo ">>>>>>    created docker-compose.yml  "
}

function checkPorts(){
    # 1023 - 65535 are legit TCP ports
    if test $HOST_PORT -lt 1023; then
        echo ""
        echo "Aborting as PORT ${HOST_PORT} cannot be lower than 1023"   
        echo ""
        exit 0
    fi
    if test $HOST_PORT -gt 65535; then
        echo ""
        echo "Aborting as PORT ${HOST_PORT} cannot be greater than 65535"   
        echo ""
        exit 0
    fi
    
    let "SERVER_PORT=HOST_PORT+1"

    # Connection to localhost 1111 port [tcp/*] succeeded!
    # nc: connect to localhost port 1114 (tcp) failed: Connection refused
        
    if ( nc -zv $HOST_IP ${HOST_PORT} 2>&1 >/dev/null ); then
        echo ""
        echo "Aborting as PORT ${HOST_PORT} already in use"   
        echo ""
        exit 0
    else
        echo "PORT ${HOST_PORT} available"
    fi

    if ( nc -zv $HOST_IP ${SERVER_PORT} 2>&1 >/dev/null ); then
        echo ""
        echo "Aborting as PORT ${SERVER_PORT} already in use"   
        echo ""
        exit 0
    else
        echo "PORT ${SERVER_PORT} available"
    fi
}

function getImageTagToPull(){
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
        IMAGE_TAG="latest"    
    fi
    echo "OK. Pulling '$IMAGE_TAG' image tag "
}

function installationProcess(){
    echo "Installation process starting ... $1"
    echo " "
    if [ "$1" == "1" ]; then
        getImageTagToPull
    fi
    if test -f "$FILE"; 
    then
        #echo "$FILE exists."
        echo "** Previous installation found **"
        echo "Press RETURN to remove previous and setup new dxc OR press any other key to abort"
        read -s -n 1 VAR
        if [ "$VAR" = "" ]; 
        then
            if test -f ".env"; 
            then
                rm .env
            fi    
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

    echo -n "Do you want to check provided IP reachable via ping (Y/N) : "
    read TEMP_VAR
    if [ "$TEMP_VAR" == "y" ] || [ "$TEMP_VAR" == "Y" ] ; then
        echo "Checking whether provided IP is available via ping"
        ping -c 1 $HOST_IP; echo "Ping check result : " $? 
    else
        echo "Checking of IP is skipped !! Make sure the IP is reachable"
    fi
    
    # get PORT
    echo -n "Please provide PORT : "
    read TEMP_VAR
    if [ "$TEMP_VAR" != "" ]; then
        HOST_PORT=$TEMP_VAR
        checkPorts
    else
        HOST_PORT=$HOST_PORT_DEFAULT    
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
}

function restartProcess(){
    echo "Restarting DXC ..."
    echo " "
    if test -f "$FILE";
    then
        echo "Press RETURN to normal restart using existing SETUP OR press any other key to edit settings"
        read -s -n 1 VAR
        if [ "$VAR" = "" ]; 
        then
            echo "###  Normal Restart ..."
        else
            echo "Press RETURN to pull latest image OR press any other key to provide new image tag to pull from docker hub"
            read -s -n 1 VAR
            if [ "$VAR" = "" ]; 
            then
                echo "Pull latest image ..."
            else
                getImageTagToPull
            fi
            createDockerCompose     
        fi
        echo ""
        echo "Restarting ..."    
    else
        echo ""
        echo "#### Aborting. No .env or docker-compose.yml files found. Please re-run this setup scriopt to install DXC ..."
        echo ""
        exit 1
    fi    
}

if test $# -eq 0; then
  echo ""
  echo "No arguments supplied. For brief info execute with -h or --help"   
  echo ""
  exit 0
fi

# check if docker and docker-compose in installed or not
checkDocker


while test $# -gt 0; do
  case "$1" in
    -h|--help)
      echo "$package - Databroker eXchange Controller - Installation Script v1.0 "
      echo " "
      echo "$scriptname [options] [arguments]"
      echo " "
      echo "options:"
      echo "-h, --help      show brief help"
      echo "-i              install new dxc with 'latest' tag, if already installed then it will be removed on approval"
      echo "-t              install new dxc with TAG as specified by user, if already installed then it will be removed on approval"
      echo "-r              restart dxc, option to change image tag to pull"
      exit 0
      ;;
    -i)
      installationProcess 0
      break;  
      ;;
    -I)
      installationProcess 0
      break;  
      ;;
    -t)
      installationProcess 1
      break;  
      ;;
    -T)
      installationProcess 1
      break;  
      ;;
    -r)
      restartProcess
      break;
      ;;
    -R)
      restartProcess
      break;
      ;;
    *)
      echo "Wrong arguments supplied. For brief info execute with -h or --help"   
      echo ""
      exit 0
      ;;  
  esac
done

echo "docker-compose down"
docker-compose down 
echo "docker-compose pull"
docker-compose pull
echo "docker-compose up -d"
docker-compose up -d
echo " "
echo "Completed !!!!"

