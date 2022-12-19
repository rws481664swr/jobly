const { BadRequestError } = require("../expressError");


/**
 * generates SQL UPDATE SET string for key value pairs in dataToUpdate
 * and returns corresponding parameter list for pg query.
 *
 * @param dataToUpdate key value pairs in object to update
 * @param jsToSql object mapping keys names in JSON object to sql column names ...
 * jsToSQL['songNmae'] might equal 'song_name' in postgres
 * @returns {{values: any[], setCols: string}}
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
