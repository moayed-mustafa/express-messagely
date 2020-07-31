/** User class for message.ly */
const db = require('../db')
const ExpressError = require('../expressError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { BCRYPT_WORK_FACTOR} = require('../config')
const { SECRET_KEY } = require('../config')
const {getCurrentTime} = require('../get_date')



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register( username, password, first_name, last_name, phone ) {
    try {
      // check if all the data is actually present
    if (!username || !password || !first_name || !last_name || !phone) {
        console.log(username)
        throw new ExpressError(" Some data is missing", 422)
    }
      const hashed_password = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
      const join_at = getCurrentTime()

      const result = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, phone, join_at)
        VALUES ($1,$2,$3,$4,$5, $6)
        RETURNING username `, [username, hashed_password, first_name, last_name, phone, join_at]);
    return result.rows[0]

    } catch (e) {
      throw new ExpressError('Duplicate User', 422)
  }
    }



  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(`
        SELECT username, password FROM users
        WHERE username = $1
        `, [username])
    const user = result.rows[0]
    if (user) {

      if (await bcrypt.compare(password, user.password)) {

        // make a token
        const token = jwt.sign({ user }, SECRET_KEY)
        return { user, token }
      }

    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const currentTimeStamp = getCurrentTime()
    console.log(currentTimeStamp)
        await db.query(`
        UPDATE users
        SET last_login_at= $1
        WHERE username = $2
        `,[currentTimeStamp,username])
    /** All: basic info on all users:
     * [{username, first_name, last_name, phone}, ...] */

  }

  static async all() {
    const result = await db.query(`
    SELECT username, first_name, last_name, phone
    FROM USERS
    `)
    return result.rows

  }



  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */
  static async get(username) {
    // check if username exists
    if (username == undefined) {
      throw new ExpressError('name is not available', 404)
    }
      const result = await db.query(`
      SELECT username, first_name, last_name, phone,last_login_at, join_at
      FROM USERS
      WHERE username = $1
      `, [username])
      return result.rows[0]

  }



  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */
  static async messagesFrom(username) {
    if (username == undefined) {
      throw new ExpressError('name is not available', 404)
    }
    const messagesFromUser = await db.query(`
    SELECT id, to_username, body, sent_at, read_at
    FROM messages
    WHERE from_username = $1
    `, [username])
    console.log("messages in the messages class ")
    return messagesFromUser.rows
  }

/** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */



  static async messagesTo(username) {
    if (username == undefined) {
      throw new ExpressError('name is not available', 404)
    }
    const messagesToUser = await db.query(`
    SELECT id, from_username, body, sent_at, read_at
    FROM messages
    WHERE to_username = $1
    `, [username])
    return messagesToUser.rows
  }
}


module.exports = User;