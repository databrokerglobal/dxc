#!/bin/bash

# Usage examples:
# - ./deploy.sh mintnet --reset
# - ./deploy.sh tobalaba

npm run build
ETHEREUM_DEPLOYER_SEED="pudding advice adult just glue vast update problem problem ski write gauge" npm run truffle -- migrate --network $@
