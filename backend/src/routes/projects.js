const router = require('express').Router()
const authValidate = require("../middleware/auth.js")
const pool = require("../pool")
const simulate = require("../simulator")


router.get("/:projectId",authValidate,async (req,res) => {
  try {
    const {projectId} = req.params
    const userId = req.user.userId
    const db_query = `SELECT name,archi_json FROM projects 
                      WHERE project_id=$1 AND user_id=$2`
    const db_res = await pool.query(db_query,[projectId,userId])
    if(db_res.rows.length == 0){
      res.status(404).json({msg:"no such project in database"})
    }
    else{
      const {name,archi_json} = db_res.rows[0]
      res.status(200).json({
        name,
        archi_json,
        msg:"project found"
      })
    }
  } catch (err) {
      res.status(500).json({error:err.message,msg:"database error"})
  }
})

router.post("/",authValidate,async(req,res)=>{
  try {
    const userId = req.user.userId
    const {name,archiJson} = req.body
    if(!name){
      return res.status(400).json({
        msg:"Project name required"
      });
    }

    const db_query = `INSERT INTO projects (user_id,name,archi_json)
                      VALUES ($1,$2,$3) RETURNING *`
    const db_res = await pool.query(db_query,[userId,name,archiJson])
    if(db_res.rows.length == 0){
      res.status(400).json({msg:"couldn't add the project"})
    }else {
      res.status(201).json({project:db_res.rows[0],msg:"project added successfully"})
    }
  } catch (err) {
    res.status(500).json({error:err.message,msg:"database error"})
  }
})

router.get("/",authValidate,async(req,res)=>{
  try {
    const userId = req.user.userId
    const db_query = `SELECT * FROM projects WHERE user_id=$1`
    const db_res = await pool.query(db_query,[userId])
    if(db_res.rows.length == 0) {
      return res.status(404).json({msg:"no projects found"})
    }
    res.status(200).json({projects:db_res.rows,msg:"fetched projects"})
  } catch (err) {
      res.status(500).json({error:err.message,msg:"database error"})
  }
})

router.post("/:projectId/simulate",authValidate,async(req,res)=>{
  try {
    const {projectId} = req.params
    const {reqPerSec} = req.body
    const userId = req.user.userId
    const db_query = `SELECT archi_json from projects WHERE project_id=$1 AND user_id=$2`
    const db_res = await pool.query(db_query,[projectId,userId])
    const {archi_json} = db_res.rows[0]
    if(!archi_json){
      return res.status(404).json({msg:"no architecture found"})
    }
    const sim_json = simulate(archi_json,reqPerSec)
    return res.status(200).json({sim_json,msg:"simulation successfull"})
  } catch (err) {
      return res.status(500).json({error:err.message,msg:"database errror"})
  }
})

module.exports = router
