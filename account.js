const AccountSystem = {
    // Relative URL works perfectly on Render
    BASE_URL: window.location.origin,

    async login(username, password) {
        console.log(`>> INITIATING_LINK: ${username}...`);
        try {
            const response = await fetch(`${this.BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            if (result.success) {
                sessionStorage.setItem('titan_data', JSON.stringify(result.data));
                return { success: true, data: result.data };
            }
            return { success: false, message: result.message };
        } catch (error) {
            return { success: false, message: "SERVER_OFFLINE" };
        }
    },

    async signup(username, password) {
        try {
            const response = await fetch(`${this.BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            if (result.success) return { success: true, data: result.data };
            return { success: false, message: result.message };
        } catch (error) {
            return { success: false, message: "SERVER_OFFLINE" };
        }
    },

    async saveProgress(username, data) {
        try {
            await fetch(`${this.BASE_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, data })
            });
            sessionStorage.setItem('titan_data', JSON.stringify(data));
            return true;
        } catch (e) { return false; }
    },

    async saveCoins(username, coins) {
        try {
            const response = await fetch(`${this.BASE_URL}/update-coins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, coins })
            });
            return (await response.json()).success;
        } catch (e) { return false; }
    },

    logout() {
        sessionStorage.clear();
        window.location.href = '/'; 
    }
};
