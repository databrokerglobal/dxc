#! /bin/bash

rm -rf DXC_ARM32v6_Build_*

set -e

BUILD_DIR=DXC_ARM32v6_Build_$(date +%Y%m%d)

mkdir ${BUILD_DIR}
env CC=arm-none-eabi-gcc CGO_ENABLED=1 GOOS=linux GOARCH=arm GOARM=6
go build -o ${BUILD_DIR}/dxc
cd databroker-signature
env CC=arm-none-eabi-gcc GOOS=linux GOARCH=arm GOARM=6
go build -o databroker-signature
cd ..
mv ./databroker-signature/databroker-signature ${BUILD_DIR}
cp .env ${BUILD_DIR}/.env
pushd ui
npm i
npm run build
popd
mv ui/build ${BUILD_DIR}/build
