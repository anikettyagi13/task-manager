const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB,{
    useNewUrlParser:true,
    useCreateIndex:true
});