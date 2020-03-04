#! /bin/bash

mkdir "dxc_build_$(date +%Y%m%d)" &&
go build -o "dxc_build_$(date +%Y%m%d)"/dxc &&
touch "dxc_build_$(date +%Y%m%d)"/dxc.db &&
cd ui &&
npm i &&
npm run build &&
cd .. &&
cp -r build/ "dxc_build_$(date +%Y%m%d)"/build
