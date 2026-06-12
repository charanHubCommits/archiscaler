const path = require("path")
require("dotenv").config({path: path.resolve(__dirname,"../.env")})

const express = require("express")
const app = express()
const userRouter = require("./routes/users")
//const projectRouter = require("./routes/projects")
const authRouter = require("./routes/auth")
app.use(express.json())

app.use("/users",userRouter)
//app.use("/projects",projectRouter)
app.use("/auth",authRouter)

app.listen(process.env.PORT,()=>{
  console.log("Runing in port",process.env.PORT)
})
