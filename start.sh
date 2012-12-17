#! /bin/bash

ROOT_FOLDER=$(dirname $(dirname $0))

exec env NODE_PATH="$ROOT/lib" node web.js
