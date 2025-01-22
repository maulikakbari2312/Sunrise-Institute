require("dotenv").config();
const mongoose = require("mongoose");
const connectionString = process.env.MONGO_URL;

async function connectToDatabase() {
    try {
        await mongoose.connect(connectionString, {
            useUnifiedTopology: true 
        });
        console.log("Database is connected successfully.");
    } catch (err) {
        console.error(err);
    }
}

connectToDatabase();
