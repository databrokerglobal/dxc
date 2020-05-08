#! /bin/bash

rm -rf dxc_build_*

set -e

BUILD_DIR=dxc_build_$(date +%Y%m%d)

mkdir ${BUILD_DIR}
go build -o ${BUILD_DIR}/dxc
cd databroker-signature
go build -o databroker-signature
cd ..
cp ./databroker-signature/databroker-signature ${BUILD_DIR}
touch ${BUILD_DIR}/dxc.db
cp .env ${BUILD_DIR}/.env
pushd ui
npm i
npm run build
popd
mv ui/build ${BUILD_DIR}/build
