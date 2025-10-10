class ApiKeyManager {
    constructor(keys) {
        this.keyUsage = keys.map(key => ({
            key,
            count: 0
        }));
    }

    getNextKey() {
        // Sort by usage count (ascending)
        this.keyUsage.sort((a, b) => a.count - b.count);
        // Get the key with minimum usage
        const keyObject = this.keyUsage[0];
        // Increment the usage count
        keyObject.count++;
        return keyObject.key;
    }
}

export default ApiKeyManager;
