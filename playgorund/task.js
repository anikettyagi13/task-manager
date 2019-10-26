require("../src/db/mongoose");
const Task = require("../src/models/task")

// Task.findByIdAndRemove('5daace79b773d03898929d90').then((task)=>{
//     console.log(task);
//     return Task.find({completed:false})
// }).then((tasks)=>{
//     console.log(tasks.length);
// }).catch((e)=>{
//     console.log(e)
// });

const deleteAndUpdate = async (id)=>{
await Task.findByIdAndDelete(id);
return await Task.countDocuments({ completed:true })
}

deleteAndUpdate('5daad40643a4d50994ff39a7').then((result)=>{
    console.log(result)
}).catch((e)=>{
    console.log(e)
})