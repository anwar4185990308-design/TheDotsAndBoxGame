const express = require('express');

const mongoose = require('mongoose');

const path = require('path');

const cors = require('cors');

const bodyParser = require('body-parser');



const app = express();



// --- PRODUCTION CONFIGURATION ---

app.use(cors());

app.use(bodyParser.json());

app.use(express.static(__dirname)); 



// --- MONGODB CONNECTION ---

const MONGO_URI = "mongodb+srv://anamuyt66tt_db_user:wbEIKDFt6Fl8YSAO@cluster0.my8z8ya.mongodb.net/?appName=Cluster0";



mongoose.connect(MONGO_URI)

    .then(() => console.log(">> DATABASE_SYNC: [ CONNECTED TO CLUSTER0 ]"))

    .catch(err => console.error(">> DATABASE_SYNC_FAILURE:", err));



// --- DATA MODELS ---

const UserSchema = new mongoose.Schema({

    username: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    level: { type: Number, default: 1 },

    xp: { type: Number, default: 0 },

    wins: { type: Number, default: 0 },

    streak: { type: Number, default: 0 },

    coins: { type: Number, default: 0 },

    inventory: { type: [String], default: ["🔘"] },

    // equippedSkin stores: { emoji: "🔥", primary: "#hex", secondary: "rgba" }

    equippedSkin: { type: mongoose.Schema.Types.Mixed, default: null },

    upgrades: {

        streak: { type: Number, default: 0 },

        xp: { type: Number, default: 0 },

        coin: { type: Number, default: 0 }

    }

});



const User = mongoose.model('User', UserSchema);



// --- MASTER GATEWAY STATUS ---

app.get('/status', (req, res) => {

    res.send(`

        <body style="background:#050508; color:#00f2ff; font-family:monospace; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; border: 10px solid #ff0055; margin:0;">

            <h1 style="color:#ff0055; letter-spacing:10px; font-size:3rem; text-shadow: 0 0 20px #ff0055;">TITAN_OS: MASTER_CORE</h1>

            <div style="background:rgba(0,242,255,0.05); padding:30px; border:1px solid #333; box-shadow: 0 0 30px rgba(0,0,0,1);">

                <p style="color:#00f2ff;">> NEURAL_GATEWAY: [ ACTIVE ]</p>

                <p style="color:#00ff66;">> DATABASE_SYNC: [ MONGODB_CONNECTED ]</p>

                <p style="color:#ffcc00;">> PORT_LISTENER: ${process.env.PORT || 3000}</p>

                <p style="color:#ff0055;">> HOST: RENDER_PRODUCTION</p>

            </div>

        </body>

    `);

});



// --- AUTHENTICATION MODULES ---

app.post('/signup', async (req, res) => {

    try {

        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });

        if (existingUser) return res.json({ success: false, message: "ID_TAKEN" });



        const newUser = new User({ username, password });

        await newUser.save();

        console.log(`[AUTH] New Pilot Enrolled: ${username}`);

        res.json({ success: true, data: newUser });

    } catch (error) {

        res.status(500).json({ success: false, message: "SERVER_ERROR" });

    }

});



app.post('/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await User.findOne({ username, password });

        if (!user) return res.json({ success: false, message: "NOT_FOUND_OR_INVALID" });



        console.log(`[AUTH] Pilot Linked: ${username}`);

        res.json({ success: true, data: user });

    } catch (error) {

        res.status(500).json({ success: false, message: "SERVER_ERROR" });

    }

});



// --- BANKING & PROGRESSION MODULES ---

app.get('/get-coins/:username', async (req, res) => {

    try {

        const user = await User.findOne({ username: req.params.username });

        res.json({ success: true, coins: user ? user.coins : 0 });

    } catch (e) { res.status(500).json({ success: false }); }

});



app.post('/update-coins', async (req, res) => {

    try {

        const { username, coins } = req.body;

        await User.findOneAndUpdate({ username }, { coins });

        console.log(`[BANK] ${username} credits updated: ${coins}₮`);

        res.json({ success: true });

    } catch (e) { res.status(500).json({ success: false }); }

});



// Universal Save Endpoint (Saves level, xp, wins, streak, and skins)

app.post('/save', async (req, res) => {

    try {

        const { username, data } = req.body;

        await User.findOneAndUpdate({ username }, { 

            level: data.level, 

            xp: data.xp, 

            wins: data.wins, 

            streak: data.streak,

            equippedSkin: data.equippedSkin, // Stores the color theme and emoji

            inventory: data.inventory,

            upgrades: data.upgrades

        });

        res.json({ success: true });

    } catch (e) { res.status(500).json({ success: false }); }

});



// --- SHOP & COLLECTION ---

app.post('/update-collection', async (req, res) => {

    try {

        const { username, items } = req.body;

        await User.findOneAndUpdate({ username }, { inventory: items });

        res.json({ success: true });

    } catch (e) { res.status(500).json({ success: false }); }

});



app.post('/update-upgrades', async (req, res) => {

    try {

        const { username, upgrades } = req.body;

        await User.findOneAndUpdate({ username }, { upgrades: upgrades });

        res.json({ success: true });

    } catch (e) { res.status(500).json({ success: false }); }

});



// --- GLOBAL LEADERBOARD ---

app.get('/leaderboard', async (req, res) => {

    try {

        const leaderData = await User.find({})

            .sort({ level: -1, wins: -1 })

            .limit(10)

            .select('username level wins -_id');

        res.json(leaderData);

    } catch (e) { res.status(500).json({ success: false }); }

});



// --- RENDER ROUTING FIX ---

app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'shop.html')));

app.get('/game', (req, res) => res.sendFile(path.join(__dirname, 'game.html')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`\n>> TITAN_OS MASTER SERVER ONLINE [PORT ${PORT}]`);

});
