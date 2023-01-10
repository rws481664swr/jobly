"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");
const {UnauthorizedError} = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }
        return next();
    } catch (err) {
        return next();
    }
}

const loggedIn = ({locals: {user}}) => user && true


const isAdmin = ({locals: {user}}) => (user.isAdmin) && true


/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
    try {
        if (!loggedIn(res)) throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next(err);
    }
}


function ensureAdmin(req, res, next) {
    try {
        if (!loggedIn(res) || !isAdmin(res)) throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next(err);
    }
}


const isUser = (u, {locals: {user}}) => u === user.username

function ensureAdminOrLoggedInUser({params: {username}}, res, next) {
    try {
        if (!loggedIn(res)) throw new UnauthorizedError();
        if (!isAdmin(res) && !isUser(username, res)) throw new UnauthorizedError()
        return next();
    } catch (err) {
        return next(err);
    }
}


module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureAdminOrLoggedInUser

};
