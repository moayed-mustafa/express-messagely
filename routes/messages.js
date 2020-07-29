const express = require('express')
const router = express.Router()

const ExpressError = require('../expressError')

const Message = require('../models/message')
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth')




/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {

        const message = await Message.get(req.params.id)
         Message.canView(req.user.user.username ,message.to_user.username,message.from_user.username)

        return res.json({result:message})

    } catch (e) {
        return next(e)
    }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
    try {
        const { from_username, to_username, body } = req.body
        if (!from_username || !to_username || !body) {
            throw new ExpressError('Data is Missing', 404)
        }
        if (from_username != to_username) {
            console.log(from_username, to_username, body)
            const message = await Message.create({ from_username, to_username, body })
            console.log(message)
            return res.json({ result: message })

        }
        throw new ExpressError('Message has to be between two users')

    } catch (e) {

        if (e.code == "23503") {
            console.log('reading error')
            return next(new ExpressError(`Either from_username or to_username does not exist`, 404))
        }
            return next(e)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/:username/read', ensureLoggedIn , ensureCorrectUser, async (req, res, next) => {
    try {
        const checked = await Message.markRead(req.params.id, req.params.username)
        console.log(checked)
        return res.json({checked})

    } catch (e) {

    }
})



 module.exports = router;