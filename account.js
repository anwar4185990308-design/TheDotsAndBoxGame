/**
 * ACCOUNT.JS - Neural Authentication & Sync Bridge
 * Manages identity verification and database synchronization.
 */

const AccountSystem = {
    // Dynamically detects if running on Localhost or Render
    apiBase: window.location.origin,

    /**
     * Authenticates existing Pilot
     */
    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("LOGIN_ERROR:", error);
            return { success: false, message: "SERVER_UNREACHABLE" };
        }
    },

    /**
     * Registers new Pilot Identity
     */
    async signup(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("SIGNUP_ERROR:", error);
            return { success: false, message: "SERVER_UNREACHABLE" };
        }
    },

    /**
     * Saves combat progress (XP, Wins, Level)
     */
    async saveProgress(username, data) {
        try {
            await fetch(`${this.apiBase}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, data })
            });
            // Update local session to keep Hub in sync
            sessionStorage.setItem('titan_data', JSON.stringify(data));
        } catch (error) {
            console.error("PROGRESS_SYNC_ERROR:", error);
        }
    },

    /**
     * Saves Neural Credits (Coins)
     */
    async saveCoins(username, coins) {
        try {
            await fetch(`${this.apiBase}/update-coins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, coins })
            });
        } catch (error) {
            console.error("CREDIT_SYNC_ERROR:", error);
        }
    },

    /**
     * Terminates Session
     */
    logout() {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
};
