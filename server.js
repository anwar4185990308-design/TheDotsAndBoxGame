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
    // This is the active skin configuration (Emoji + Colors)
    equippedSkin: { 
        type: mongoose.Schema.Types.Mixed, 
        default: { emoji: "🔘", primary: "#00f2ff", secondary: "rgba(0, 242, 255, 0.2)" } 
    },
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

// --- AUTHENTICATION ---
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.json({ success: false, message: "ID_TAKEN" });

        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ success: true, data: newUser });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) return res.json({ success: false });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- SKIN DATA FETCHING ---
app.get('/get-skin/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user && user.equippedSkin) {
            res.json({ success: true, skin: user.equippedSkin });
        } else {
            res.json({ success: false });
        }
    } catch (e) { res.status(500).json({ success: false }); }
});

// --- SAVING & SYNCING ---
app.post('/save', async (req, res) => {
    try {
        const { username, data } = req.body;
        // This updates everything: coins, inventory, and the active skin
        await User.findOneAndUpdate({ username }, { 
            level: data.level, 
            xp: data.xp, 
            wins: data.wins, 
            streak: data.streak,
            coins: data.coins,
            inventory: data.inventory,
            equippedSkin: data.equippedSkin, 
            upgrades: data.upgrades
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

// --- OTHER ENDPOINTS ---
app.get('/get-coins/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    res.json({ success: true, coins: user ? user.coins : 0 });
});

app.post('/update-coins', async (req, res) => {
    const { username, coins } = req.body;
    await User.findOneAndUpdate({ username }, { coins });
    res.json({ success: true });
});

app.get('/leaderboard', async (req, res) => {
    const leaderData = await User.find({}).sort({ level: -1 }).limit(10).select('username level wins');
    res.json(leaderData);
});

// --- ROUTES ---
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'shop.html')));
app.get('/game', (req, res) => res.sendFile(path.join(__dirname, 'game.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`>> TITAN_OS ONLINE ON PORT ${PORT}`));
