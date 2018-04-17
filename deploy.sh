#!/bin/bash

set -e

export NODE_ENV=${NODE_ENV:=test}
export PORT=${PORT:=8097}
export NAME=bdr
export INSTANCES=1

# stop old instance
echo "stop old instance"
pm2 delete --silent $NAME &>/dev/null || true

# install packages and build front-end app
echo "install packages"
npm install

# build app
npm run build

# change absolute path to relative
sed -i 's/\/static/static/g' $(pwd)/build/index.html

# enter into server directory adn run npm install
cd api-server
npm install

# start new instance
echo "starting services"
pm2 start app.js -i $INSTANCES --name="$NAME"

# return to project's root
cd ..

