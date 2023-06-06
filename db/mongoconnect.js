const mongoose = require('mongoose');
const {config} = require("../config/secret");
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(`mongodb+srv://${config.userDB}:${config.passDB}@cluster0.epj4lot.mongodb.net/michalCloud`);
  console.log("mongo connect to michalCloud")
  
}

