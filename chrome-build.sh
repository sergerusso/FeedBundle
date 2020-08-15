#!/usr/bin/env bash

rm -R build/*

cp -R assets build/
cp -R views build/
cp background.html build/
cp dialog.html build/
cp index.html build/
cp LICENSE.html build/
cp manifest.json build/

cd build
zip -r build.zip .