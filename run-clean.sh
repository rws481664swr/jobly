for file in ./app.test.js ./config.test.js $(find routes models middleware helpers -name '*.test.js'); do
  jest $file
  echo "----------< From $file >----------"
  sleep 2
#  psql jobly_test  <  ./jobly-schema.sql ;
#  sleep 1
done
