  psql jobly_test  <  ./jobly-schema.sql ;
  sleep 1
  echo "Starting to run tests.... "
  sleep 3
for file in ./app.test.js ./config.test.js $(find routes models middleware helpers -name '*.test.js'); do
  jest $file
  echo " ^^^ test results ^^^ || ---------- From $file ----------"
  sleep 2
done
