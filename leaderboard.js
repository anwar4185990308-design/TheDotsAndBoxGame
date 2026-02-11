/**
 * LEADERBOARD.JS - Neural Global Ranking Interface
 * Optimized for MongoDB Production Environment
 */
const GlobalLeaderboard = {
    // Uses relative path to automatically route through your Render domain
    api: "/leaderboard",

    async fetchAndRender() {
        const lbContainer = document.getElementById('lb-content');
        if (!lbContainer) return;

        // Show loading state if empty
        if (lbContainer.innerHTML === "") {
            lbContainer.innerHTML = `<div style="padding:20px; color:#444; font-family:'Fira Code'; font-size:0.7rem;">ACCESSING_GLOBAL_DATABASE...</div>`;
        }

        try {
            // Fetch top pilots from the MongoDB collection via server.js
            const response = await fetch(this.api);
            if (!response.ok) throw new Error("NETWORK_SATELLITE_OFFLINE");
            
            const players = await response.json();
            const currentUser = sessionStorage.getItem('titan_user');

            if (!players || players.length === 0) {
                lbContainer.innerHTML = `<div style="padding:10px; color:#444;">AWAITING_PILOT_ENROLLMENT...</div>`;
                return;
            }

            // Map the database results into the UI
            lbContainer.innerHTML = players.map((player, index) => {
                const isSelf = player.username === currentUser;
                
                // Visual Rank Indicators
                let rankColor = '#888';
                let glow = 'none';
                
                if (index === 0) { 
                    rankColor = '#ffcc00'; // Gold
                    glow = '0 0 10px rgba(255, 204, 0, 0.3)';
                } else if (index === 1) { 
                    rankColor = '#00f2ff'; // Cyan
                } else if (index === 2) { 
                    rankColor = '#ff0055'; // Pink/Red
                }

                return `
                    <div class="lb-entry ${isSelf ? 'active' : ''}" 
                         style="border-bottom: 1px solid #111; 
                                padding: 12px 10px; 
                                display:flex; 
                                justify-content:space-between; 
                                align-items:center;
                                background: ${isSelf ? 'rgba(0, 242, 255, 0.05)' : 'transparent'};
                                border-left: ${isSelf ? '2px solid #00f2ff' : 'none'};">
                        
                        <div style="display:flex; flex-direction:column;">
                            <span style="color:${rankColor}; font-weight:bold; font-family:'Orbitron'; font-size:0.8rem; text-shadow:${glow};">
                                #${index + 1} ${player.username.toUpperCase()}
                            </span>
                            ${isSelf ? '<span style="font-size:0.5rem; color:#00f2ff;">[ YOU ]</span>' : ''}
                        </div>

                        <div style="text-align:right; font-family:'Fira Code';">
                            <div style="color:#00ff66; font-size:0.7rem;">LVL: ${player.level}</div>
                            <div style="color:#00f2ff; font-size:0.6rem; opacity:0.8;">WINS: ${player.wins}</div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (e) {
            console.error(">> LB_SYNC_ERROR:", e);
            lbContainer.innerHTML = `
                <div style="color:#ff0055; padding:20px; font-family:'Fira Code'; font-size:0.7rem; border:1px solid #ff0055;">
                    CRITICAL_SYNC_FAILURE<br>
                    > DATABASE_UNREACHABLE<br>
                    > RETRYING_IN_30S...
                </div>
            `;
        }
    }
};

// Initial system pulse
GlobalLeaderboard.fetchAndRender();

// Neural Refresh Rate: Update rankings every 30 seconds to keep the competitive edge
setInterval(() => GlobalLeaderboard.fetchAndRender(), 30000);
