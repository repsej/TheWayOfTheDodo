#!/bin/bash

rm -rf docs/
mkdir docs/
cd docs/
unzip ../dist/a.zip
http-server
