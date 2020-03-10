#! /bin/bash

rm -rf "dxc_build_$(date +%Y%m%d)" &&
rm -rf build &&
mkdir "dxc_build_$(date +%Y%m%d)" &&
go build -o "dxc_build_$(date +%Y%m%d)"/dxc &&
touch "dxc_build_$(date +%Y%m%d)"/dxc.db &&
cp .env-example "dxc_build_$(date +%Y%m%d)"/.env &&
cd ui &&
npm i &&
npm run build &&
cd .. &&
cp -r build/ "dxc_build_$(date +%Y%m%d)"/build
