const sgmail = require('@sendgrid/mail');

sgmail.setApiKey(process.env.SENDGRID_API_KEY);


const welcomeUser = (email)=>{
     sgmail.send({
        to:email,
        from:'anikettyagi13@gmail.com',
        subject:'Thanks for joining in...',
        text:'You can manage your task with this app.'
   });
}
const goodbye = (email)=>{
    sgmail.send({
    to:email,
    from:'anikettyagi13@gmail.com',
    subject:'SO SORRY!!!!',
    text:"We are so sorry that you didn't find our service nice. PLEASE write us telling what was missing..."
    })
}

module.exports = {
    welcomeUser,
    goodbye
}