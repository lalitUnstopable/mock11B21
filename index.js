const express = require("express");

require("dotenv").config();

const {connection} = require("./config/db");

const {UserModel} = require("./model/UserModel");

const jwt = require("jsonwebtoken");

const cors = require("cors");

const bcrypt = require("bcrypt");

const {authentication} = require("./authentication");

const app = express()
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("Hello")
})

app.post("/signup",async(req,res)=>{
    const {email,password} = req.body;

    const usePresent = await UserModel.findOne({ email });
    if(usePresent?.email){
        req.send("Try logging in ,user already exist");
    }
    else{
        try {
            bcrypt.hash(password,5,async function (err,hash){
                const user = new UserModel({email,password:hash});
                await user.save();
                res.send("Signup Done")
            })
        } catch (error) {
            console.log(error);
            res.send("Something went wrong, pls try again later");
        }
    }
})

app.post("/login",async (req,res) => {
    const {email,password} = req.body;
    try {
        const user = await UserModel.find({email});
        if(user.length>0){
            const hashed_password = user[0].password;
            bcrypt.compare(password,hashed_password,function (err,result){
                if(result){
                    const token = jwt.sign({userID:user[0]._id},"hush");
                    res.send({msg:"Login successfully",token:token});
                }
                else{
                    res.send("Login failed");
               }
            }) 
        }
        else{
            res.send("Error")
        }
    } catch (error) {
        res.send("Something went wrong, please try again later");
   }
})

app.use(authentication);

app.listen(process.env.PORT, async () => {
    try {
        await connection;
        console.log("Connected to DB Successfully");
      } catch (err) {
        console.log("Error connecting to DB");
        console.log(err);
      }
    console.log(`Listning at PORT http://localhost:${process.env.PORT}`);
})