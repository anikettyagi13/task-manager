const bcrypt = require('bcryptjs')

const yo = async ()=>{
const password = await bcrypt.hash('aniketis',8)
console.log(password);
const isMatch = await bcrypt.compare("aniketis","$2a$08$snTHzNemZuQs/leWK3Tk4OocErFJy3EXjUkpwXpnegReYlkTRreRK");
console.log(isMatch);
}

yo();
