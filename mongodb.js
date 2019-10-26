const mongodb = require("mongodb")
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";


MongoClient.connect(connectionURL,{ useNewUrlParser:true }, (error,client)=>{
if(error){
    return console.log(error);
}

const db = client.db(databaseName);
// db.collection("users").insertOne({
//     name:"Aniket",
//     age: 17
// }) 
// db.collection("users").findOne({_id: ObjectId("5da872c72d00a67024ea8737")},(error,user)=>{
//     if(error){
//         console.log(error);
//     }
//     else{
//         console.log(user)
//     }
// })
// db.collection("users").insertMany([
//     {name:"rachel",
//     age:24
//     },{
//         name:"ross",
//         age: 24

//     },{
//         name:"joey",
//         age:30
//     },{
//         name: "Chandler Bing",
//         age: 23
//     }],(error,result)=>{
//         console.log(result.ops)
// //     })
//     db.collection("users").find({ age:24 }).toArray((error,user)=>{
//         console.log(user);
//         })
db.collection("users").updateMany({
    age:24
},{
    $inc:{
        age:-1
    }
}).then((result)=>{
    console.log(result);
}).catch((error)=>{
console.log(error);
})


});
