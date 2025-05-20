require('dotenv').config(); // Load .env at the very top

const express = require('express');
const connectDB = require("./connect");
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const ejsMate = require("ejs-mate");
const userModel = require('./models/user');

const app = express();

uri = "mongodb+srv://studyplanner:bRUpb2N6FhkeCEew@studyplanner.8sl7ytp.mongodb.net/Studyplanner?retryWrites=true&w=majority&appName=Studyplanner";


const connectDB = () => {
    console.log("hello")
    return mongooes.connect(uri, {
        userNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

// Load environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Check .env values
if (!MONGODB_URI || !JWT_SECRET) {
    console.error('Missing MONGODB_URI or JWT_SECRET in .env file.');
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/planner", (req, res) => res.render("planner"));
app.get("/tips", (req, res) => res.render("tips"));

// Auth: Signup Page
app.get("/signup", (req, res) => res.render("Authentication/signup"));

// Auth: Login Page
app.get("/login", (req, res) => res.render("Authentication/login"));

// Auth: Create user
app.post('/create', async (req, res) => {
    try {
        await connectDB();
        const { username, email, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await userModel.create({ username, email, password: hash });

        const token = jwt.sign({ email }, JWT_SECRET);
        res.cookie("token", token);

        res.redirect('/login');
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Auth: Login
app.post('/login', async (req, res) => {
    try {
        await connectDB();
        const user = await userModel.findOne({ email: req.body.email });

        if (!user) {
            return res.send(`<script>alert('User ID is incorrect'); window.location.href="/login";</script>`);
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (isMatch) {
            const token = jwt.sign({ email: user.email }, JWT_SECRET);
            res.cookie("token", token);
            return res.send(`<script>alert('Login successful!'); window.location.href="/";</script>`);
        } else {
            return res.send(`<script>alert('Incorrect password!'); window.location.href="/login";</script>`);
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Logout
app.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect('/');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
