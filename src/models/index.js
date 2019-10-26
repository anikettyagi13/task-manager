const express = require("express")
require("../db/mongoose");
const User =require("./user");
const Task =require("./task");
const path = require("path");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const viewPath=path.join(__dirname,"../template")
const auth = require("../middleware/auth")
const multer = require('multer');
const sharp = require('sharp');
const {welcomeUser,goodbye} = require('../email/account')
const app = express()

const port = process.env.PORT;
const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!((file.originalname.endsWith('png'))||(file.originalname.endsWith('jpg'))||(file.originalname.endsWith('jpeg')))){
            return cb(new Error('file must be eighter a png jpg jpeg'));
        }
        return cb(undefined,true);
    }
});


app.use(express.json());
app.set("view engine", "ejs");
app.set("views",viewPath)
// app.use(bodyParser.urlencoded({extended:true}));

app.get("/user",(req,res)=>{
    res.render("user")
})
app.post("/user",async (req,res)=>{
    console.log(req.body);
    const user = new User(req.body)
    try{ 
       await user.save();
       welcomeUser(user.email);
       const token =await user.genrateToken();
       res.status(201).send({user,token});
    }catch(e){
        res.status(500).send(e);
    }
 })
 app.post("/user/login",async (req,res)=>{
     try{
         const user = await User.findByCredentials(req.body.email,req.body.password);
          const token = await user.genrateToken();
         res.status(200).send({user,token})
    }catch(e){
     res.status(400).send(e);
     }
 })
 app.post("/user/logout",auth, async(req,res)=>{
     req.user.tokens = req.user.tokens.filter((token)=>{
         return token.token!== req.token;
     })
     await req.user.save();
     res.status(200).send();
 })
 app.post("/user/logoutAll",auth, async(req,res)=>{
     req.user.tokens = [];
     await req.user.save();
     res.status(200).send();
 })

app.get("/users",auth,async (req,res)=>{
       console.log(req.user.task)
      res.send(req.user);
})
app.get("/users/:id",async (req,res)=>{
   try{
       var user= await User.findById(req.params.id)
       if(!user){
           return res.status(404).send("no user found");
       }
       res.status(200).send(user);
   }catch(e){
       res.status(500).send()
   }
})

app.patch("/users/me",auth, async (req,res)=>{
   try{
       const user = req.user;
       const updates = Object.keys(req.body); 
    //    const user = await User.findByIdAndUpdate(req.params.id, req.body ,{new:true,runValidators:true})
       updates.forEach((update)=>{
        user[update] = req.body[update];
        
    });
      await user.save();
     res.status(200).send(user);
   }catch(e){
      res.status(500).send()
   }
})
app.delete("/users/me",auth,async(req,res)=>{
    try{
        goodbye(req.user.email);
        await req.user.remove();
        res.status(200).send(req.user);
    }catch(e){
        res.status(500).send()
    }
})


app.get("/task",(req,res)=>{
    res.render("task")
})
app.post("/task",auth,async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    });
    try{
        await task.save()
        res.status(200).send(task);
    }catch(e){
        res.status(500).send();
    }
})

app.get("/tasks",auth,async (req,res)=>{
    try{
        const match={}
        const sort={}
         if(req.query.completed){
             match.completed= req.query.completed === 'true'
         }
         if(req.query.sortBy){
             const parts = req.query.sortBy.split(':')
             sort[parts[0]]=(parts[1]==='asc')?1:-1;
         }
         await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:Number(req.query.limit),
                skip:Number(req.query.skip),
                sort
            }
        }).execPopulate();
         res.status(200).send(req.user.tasks)
        }catch(e){
            console.log(e)
            res.status(500).send();
        }
    })
app.get("/tasks/:id",auth,async (req,res)=>{
    console.log(req.user.tasks)
    try{const task = await Task.findOne({ _id:req.params.id, owner: req.user._id });
        if(!task){
            res.status(404).send()
        }
        res.status(200).send(task);
    }catch(e){
        res.status(400).send(e)
    }
})
app.patch("/tasks/:id",auth,async (req,res)=>{
        try{
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id});
        const updates = Object.keys(req.body);
        if(!task){
            res.status(404).send()
        }
        updates.forEach((update)=>{
            task[update]= req.body[update];
        });
        await task.save();
        res.status(200).send(task)
       }catch(e){
        res.status(500).send(e);
       }
})

app.delete("/tasks/:id",auth,async(req,res)=>{
    try{
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})

        if(!task){
            res.status(404).send()
        }
        await task.remove();
        res.status(200).redirect("/tasks");
    }catch(e){
        res.status(500).send()
    }
})

app.post('/users/me/avatar',auth,upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
    req.user.avatar= buffer;
    await req.user.save()
    res.send();
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})
app.delete('/users/me/avatar',auth, async(req,res)=>{
    req.user.avatar = undefined
    req.user.save();
    res.send();
})
app.get('/users/:id/avatar',async(req,res)=>{
    const user = await User.findById(req.params.id);
    res.set("Content-Type","image/png");
    res.send(user.avatar);
})

app.listen(port,()=>{
    console.log("running"+port);
})