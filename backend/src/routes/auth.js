const path = require("path")
require("dotenv").config({path: path.resolve(__dirname,"../.env")})

const router = require("express").Router()
const bcrypt = require("bcrypt")
const pool = require("../pool")
const jwt = require("jsonwebtoken")

router.post("/register",async (req,res) => {
  try {
    const {username,email,password} = req.body
    const hashedPass = bcrypt.hash(password,10)
    const db_query = `INSERT INTO users (username,email,password)
                      VALUES ($1,$2,$3)`
    const db_res = await pool.query(db_query,[username,email,hashedPass])
    
    res.status(201).json({msg:"Successfully Registered"})
  } catch (err) {
      res.status(500).json({erro:err.message,msg:"Failed to register"})
  }   
})

router.post("/login",async(req,res) => {
  try {
    const {username,password} = req.body
    const db_query = `SELECT user_id,password_hash FROM users WHERE username=$1`
    const db_res = await pool.query(db_query,[username])
    if(db_res.rows == 0){
      return res.status(401).json({msg:"user does not exist"})
    }
    const isMatch = await bcrypt.compare(password,db_res.rows[0].password_hash)
    if(isMatch){
      const token = jwt.sign(db_res.rows[0].user_id,process.env.JWT_SECRET)
      return res.status(200).json({msg:"login successfull",token})
    }
  } catch (err) {
      return res.status(500).json({erro:err.message,msg:"database error"})
  }
})

module.exports = router
