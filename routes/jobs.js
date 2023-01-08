const router = module.exports = require("express").Router();

const jsonschema = require("jsonschema");
const jobsNew = require("../schemas/jobsNew.json");
const jobsUpdate = require("../schemas/jobsUpdate.json");
const {BadRequestError} = require("../expressError");
const {ensureLoggedIn, ensureAdminOrLoggedInUser, ensureAdmin} = require("../middleware/auth");
const Job = require("../models/job");

router.get('/', async ({query: {hasEquity, minSalary, title, ...rest}}, res, next) => {
    try {
        if (Object.keys(rest).length) throw new BadRequestError("invalid query parameters")

        const jobs = await Job.findAll({hasEquity, minSalary, title})
        res.json(jobs)
    } catch (e) {

        return next(e)
    }
})
router.get('/:id', async ({params: {id}}, res, next) => {
    try {
        const job = await Job.get(id)
        res.json(job)
    } catch (e) {
        return next(e)
    }
})
router.post('/', ensureAdmin, async ({body}, res, next) => {
    const {valid, errors} = jsonschema.validate(body, jobsNew);
    try {
        if (!valid) {
            const errs = errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(body)
        res.json(job).status(201)
    } catch (e) {
        return next(e)
    }
})
router.patch('/:id', ensureAdmin, async ({body, params: {id}}, res, next) => {
    const {valid, errors} = jsonschema.validate(body, jobsUpdate);
    try {
        if (!valid) {
            const errs = errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.update(id, body)
        res.json({job})
    } catch (e) {
        return next(e)
    }
})
router.delete('/:id', ensureAdmin, async ({params: {id}}, res, next) => {
    try {
        await Job.remove(id)
      return   res.json({message: 'deleted'}).status(200)
    } catch (e) {
        return next(e)
    }

})
