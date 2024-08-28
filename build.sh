#!/bin/bash

grunt prod --force

#npx uglifyjs dist/js/index_prod.js  --compress unsafe --mangle --toplevel > dist/i.ugly.js

npx uglifyjs dist/js/index_prod.js  --compress unsafe --mangle --toplevel > dist/i.ugly.js

#cp dist/js/index_prod.js dist/i.ugly.js
#cp dist/i.ugly.js dist/i.js

npx roadroller  --optimize 2 dist/i.ugly.js -o dist/i.js
#npx roadroller  --optimize 2 dist/js/index_prod.js -o dist/i.js

## Run roadroller with "--optimize O" to make it run forever ... or until you press ctrl-c
#npx roadroller  --optimize O dist/i.ugly.js -o dist/i.roadrolled.js

# roll html and js in to one one index.html file
# grunt rollup

########## Pack

cd dist
zip -X9 a.zip index.html i.js tiles.png 
npx advzip-bin --recompress -4 -i 1000 a.zip
ls -la a.zip

########## Test

z=$(($(wc -c < a.zip)))

d=$((13312 - $z))

#echo "zip diff : $d"

echo

if [ $d -le 0 ]
then
        echo "NOOOO !! zip size is $z (ie. $((-$d)) bytes bigger than the 13312 target)  :("
else
        echo "YAS, zip size is $z (ie. $d bytes below the 13312 target)  :)"
fi