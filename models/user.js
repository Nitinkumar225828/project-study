const mongoose = require('mongoose');
// mongoose.connect(`mongodb://localhost:27017/authentication`, {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true
// }).then(() => {
//     console.log("Connected to MongoDB");
// }).catch((err) => {
//     console.error("MongoDB connection error:", err);
// });

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,

});

const User = mongoose.model('User', userSchema);
module.exports = User;