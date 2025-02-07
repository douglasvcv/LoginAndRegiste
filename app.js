import express, { json } from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv/config.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
    
    //Create user
    const user = new User({
        name,
        email,
        password: passwordHash
    })
    try {
        
        await user.save()
        res.status(200).json({msg:"Dados recebidos com sucesso"})

    } catch (error) {
        console.log(error)
        res.status(200).json({msg:"Ocorreu um erro no servidor. Tente novamente mais tarde!"})
    }
})

//Login User
app.post("/auth/login", async (req, res)=>{
    const {email, password} = req.body

    if(!email){
        return res.status(422).json({msg:"O email é obrigatório"})
    }
    if(!password){
        return  res.status(422).json({msg:"A senha é obrigatória"})
    }
    
    //Check if user exist
    const user = await User.findOne({email:email})
    if(!user){
      return  res.status(422).json({msg:"Usuário não encontrado!"})
    }
    
    //Check if password match
    const confirmPassword = await bcrypt.compare(password, user.password)
    if(!confirmPassword){
      return  res.status(422).json({msg:"Usuário não encontrado!"})
    }

    try {
       const secret = process.env.SECRET

       const token = jwt.sign(
        {
            id: user.id,
        },
        secret,
       )

       res.status(200).json({msg:"Autenticação realizada com sucesso", token})
    } catch (error) {
        console.log(error)
        res.status(422).json({msg: "Ocorreu um erro no servidor. Tente novamente mais tarde!"})
    }
})

app.listen(3000, ()=>(console.log("Servidor rodando http://localhost:3000")))