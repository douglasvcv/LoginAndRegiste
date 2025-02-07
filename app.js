import express, { json } from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv/config.js'
import bcrypt from 'bcrypt'

const app = express()

//Credentials
const db_user = process.env.DB_USER
const db_passaword = process.env.DB_PASSWORD

//Connect database
mongoose.connect(`mongodb+srv://${db_user}:${db_passaword}@webcrawler.6mkflqw.mongodb.net/?retryWrites=true&w=majority&appName=WebCrawler`)
.then(
    ()=>{
        console.log("Conectou ao banco")
    }
)

//config
app.use(express.json())

//Models
import { User } from './models/User.js'

//Routes

//Open public route 
app.get("/", (req, res)=>{
    res.status(200).json({msg:"Bem-Vindos a minha API"})
})

//Register User
app.post("/auth/register", async (req, res)=>{
    const {name, email, password, confirmPassword} = req.body

    //Validation
    if(!name){
        return res.status(422).json({msg:"O nome é obrigatório"})
    }
    if(!email){
        return res.status(422).json({msg:"O email é obrigatório"})
    }
    if(!password){
        return  res.status(422).json({msg:"A senha é obrigatória"})
    }
    if(!confirmPassword){
        return res.status(422).json({msg:"A confirmação é obrigatória"})
    }
    if(password != confirmPassword){
       return res.status(422).json({msg:"As senhas não coincidem "})
    }

    //Check if user exist
    const userExist = await User.findOne({email:email})
    if(userExist){
        return res.status(422).json({msg:"Usuário já existe!"})
    }
    
    //Create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash= await bcrypt.hash(password, salt)
    res.status(200).json({msg:"Dados recebidos com sucesso"})

})
app.listen(3000, ()=>(console.log("Servidor rodando http://localhost:3000")))