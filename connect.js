const mongooes = require("mongoose");

uri = "mongodb+srv://studyplanner:bRUpb2N6FhkeCEew@studyplanner.8sl7ytp.mongodb.net/Studyplanner?retryWrites=true&w=majority&appName=Studyplanner";


const connectDB = () => {
     console.log("hello")
    return mongooes.connect(uri, {
        userNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

module.exports = connectDB;
