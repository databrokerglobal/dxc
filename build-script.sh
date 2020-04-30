#! /bin/bash

rm -rf dxc_build_*
rm -rf build

set -e

BUILD_DIR=dxc_build_$(date +%Y%m%d)

mkdir ${BUILD_DIR}
go build -o ${BUILD_DIR}/dxc
touch ${BUILD_DIR}/dxc.db
cp .env ${BUILD_DIR}/.env
pushd ui
npm i
npm run build
popd
mv ui/build ${BUILD_DIR}/build
