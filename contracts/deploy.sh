#!/bin/bash

# Usage examples:
# - ./deploy.sh mintnet --reset
# - ./deploy.sh tobalaba

npm run build
ETHEREUM_DEPLOYER_SEED="<deployer seed goes here>" npm run truffle -- migrate --network $@
