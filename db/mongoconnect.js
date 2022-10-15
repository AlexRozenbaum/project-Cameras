const mongoose = require('mongoose');
const { config } = require("../config/secret");

main().catch(err => console.log(err));

async function main() {
    // await mongoose.connect('mongodb://localhost:27017/black22');
    // כדי להתחבר למונגו אטלס
    await mongoose.connect(`mongodb+srv://${config.userDb}:${config.passDb}@cluster0.1trevld.mongodb.net/projectX`);
    console.log("mongo connect black 22 atlas")

    // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}