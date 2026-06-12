const router = require("express").Router()
const pool = require("../pool")
const authValidate = require("../middleware/auth.js")


router.get("/:userId",authValidate,async(req,res)=>{
  const {userId} = req.params;

  const db_query = `SELECT username FROM users WHERE users_id=$1`
  const db_res = await pool.query(db_query,[userId])

  res.status(200).json(db_res.rows)
})

module.exports = router

