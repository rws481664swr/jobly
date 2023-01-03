const {BadRequestError} = require("../expressError");

/**
 * validates and preprocesses query params for route GET /companies
 * @returns falsy value if no data sent otherwise preprocessed query object
 */
module.exports = function validateParams({minEmployees, maxEmployees, nameLike, ...rest}) {
    if (Object.keys(rest).length) throw new BadRequestError('invalid query params')
    let obj = {}
    if (nameLike) {
        obj = {name: nameLike}
    }

    if (minEmployees && maxEmployees) {
        minEmployees = parseInt(minEmployees)
        maxEmployees = parseInt(maxEmployees)
        if (isNaN(minEmployees)) throw new BadRequestError('min employees is not a number')
        if (isNaN(maxEmployees)) throw new BadRequestError('max employees is not a number')
        if (minEmployees > maxEmployees) throw new BadRequestError('invalid range for employees filter')
        obj = {...obj, minEmployees, maxEmployees}
    } else if (minEmployees) {
        minEmployees = parseInt(minEmployees)
        if (isNaN(minEmployees)) throw new BadRequestError('min employees is not a number')
        if (minEmployees < 1) throw new BadRequestError('bad value for employees query')
        obj = {...obj, minEmployees}
    } else if (maxEmployees) {

        maxEmployees = parseInt(maxEmployees)
        if (isNaN(maxEmployees)) throw new BadRequestError('max employees is not a number')
        if (maxEmployees < 1) throw new BadRequestError('bad value for employees query')
        obj = {...obj, maxEmployees}
    }
    return Object.keys(obj).length && obj
}