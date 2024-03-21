class FuelPricing {
    constructor(username, state, gallons) {
        this.username = username;
        this.state = state;
        this.gallons = gallons;
    }

    async getPricePerGallon() {
        return 2.5;
    }
}

module.exports = FuelPricing;
