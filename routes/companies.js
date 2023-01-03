"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const {max} = require("pg/lib/defaults");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    let {query}=req
    query =validateParams(query)
    console.log(query)
    const companies = await Company.findAll(query);
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});
function validateParams({minEmployees,maxEmployees,nameLike,...rest}){
  if (Object.keys(rest).length) throw new BadRequestError('invalid query params')
  let obj={}
  if(nameLike){
    obj={name:nameLike}
  }

  if(minEmployees && maxEmployees){
    minEmployees=parseInt(minEmployees)
    maxEmployees=parseInt(maxEmployees)
    if(isNaN(minEmployees)) throw new BadRequestError('min employees is not a number')
    if(isNaN(maxEmployees)) throw new BadRequestError('max employees is not a number')
    if (minEmployees>maxEmployees) throw new BadRequestError('invalid range for employees filter')
    obj= {...obj , minEmployees,maxEmployees}
  }else if (minEmployees){
    minEmployees=parseInt(minEmployees)
    if(isNaN(minEmployees)) throw new BadRequestError('min employees is not a number')
    if(minEmployees<1) throw new BadRequestError('bad value for employees query')
    obj= {...obj , minEmployees}
  }else if(maxEmployees){

    maxEmployees=parseInt(maxEmployees)
    if(isNaN(maxEmployees)) throw new BadRequestError('max employees is not a number')
    if(maxEmployees<1) throw new BadRequestError('bad value for employees query')
    obj= {...obj , maxEmployees}
  }
  return Object.keys(obj).length && obj
}
/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
