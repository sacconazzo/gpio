#!/bin/bash

git checkout .
git pull

yarn install

sudo pkill python3
sudo pkill node

sudo yarn collect &
sudo yarn manager &