const express = require("express")
const router = express.Router()


const User = require('../models/user')
const bodyParser = require("body-parser")
const ExpressError = require("../../node/express-oop-orm/expressError")
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth')

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async (req, res, next) => {
    try {

        // make a call to user model
        const users = await User.all()
        console.log(users)
        // display the result
        return res.json({users: users})

    } catch (e) {
        return next(e)
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureLoggedIn ,ensureCorrectUser,async (req, res, next) => {
    try {

        // make a call to user model
        const user = await User.get(req.params.username)
        if (user.length == 0) {
            throw new ExpressError('user not found', 404 )
        }
        // display the result
        return res.json({user: user})

    } catch (e) {
        return next(e)
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser,ensureLoggedIn,async (req, res, next) => {
    try {

        const messages = await User.messagesFrom(req.params.username)
        return res.json(messages)

    } catch (e) {
        return next(e)
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser,ensureLoggedIn,async (req, res, next) => {
    try {

        const messages = await User.messagesTo(req.params.username)
        return res.json(messages)

    } catch (e) {
        return next(e)
    }
})


module.exports = router