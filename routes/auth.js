const express = require("express")
const router = express.Router()
const expressError = require('../expressError')

const User = require('../models/user')
const bodyParser = require("body-parser")
const ExpressError = require("../../node/express-oop-orm/expressError")



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async (req, res, next) => {
    try {
        const { username, password} = req.body
        const result = await User.authenticate(username, password)
        if (result== undefined) {
            throw new ExpressError('username/password incorrect', 404)
        }
        // update login
        // try to make the time on the current timezone
        await User.updateLoginTimestamp(username)
        return res.send({message: `${result.user.username} authenticated`, token:result.token})

    } catch (e) {
        return next(e)
    }
})




/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body
        const user = await User.register(username, password, first_name, last_name, phone )
        console.log(user)
        return res.send({message: ` user ${user.username} has been registered`})

    } catch (e) {
        return next(e)
    }
})



 module.exports = router