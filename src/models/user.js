const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require('./task')
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },email:{
       type:String,
       unique:true,
       required:true,
       trim:true,
       lowercase:true,
       validate(value){
           if(!validator.isEmail(value)){
               throw new Error("incorrect email");
           }
       }
    },
    password:{
      type:String,
      required:true,
      trim:true,
      validate(value){
          if(value.length<6){
              throw  new Error("small password")
          }
          else if(value.toLowerCase().includes("password")){
              throw new Error("password cant be set as password")
          }
      }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
            throw new Error("age<0 ! good")
        }
    }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
})


userSchema.methods.toJSON = function(){
    console.log("yo?")
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

userSchema.methods.genrateToken = async function(){
    const user = this;
    const token = await jwt.sign( { _id:user._id.toString() },process.env.JWT_SECRET);
     user.tokens = user.tokens.concat({token});
     await user.save();
    return token;
}


userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email});
    console.log(user)
    if(!user){
        throw new Error("no user found");
    }
    const isMatch =  await bcrypt.compare(password,user.password);
    console.log(isMatch);
    if(!isMatch){
        throw new Error("Unable to login");
    }
    return user;
}


userSchema.pre('save',async function(next){
    const user =this;
    if(user.isModified('password')){
        try{console.log("yo");
    const password= await bcrypt.hash(user.password,8);
    user.password= password;
        }catch(e){
            console.log(e);
        }}
    next();
})
userSchema.pre('remove',async function(next){
   const user= this;
   await Task.deleteMany({ owner: user._id })
   next();
})

const User = mongoose.model("User",userSchema)


module.exports = User;