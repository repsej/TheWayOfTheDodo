#!/bin/bash

rm -rf ziptest/
mkdir ziptest/
cd ziptest/
unzip ../dist/a.zip
http-server
