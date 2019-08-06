#!/bin/bash

# Usage examples:
# - ./deploy.sh mintnet --reset
# - ./deploy.sh tobalaba

npm run build
ETHEREUM_DEPLOYER_SEED="peace keep hawk vote spoon shield income ride dentist roast suffer space" npm run truffle -- migrate $@
