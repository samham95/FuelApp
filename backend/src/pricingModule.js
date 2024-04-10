class FuelPricing {
    constructor(username, state, gallons) {
        this.username = username;
        this.state = state;
        this.gallons = gallons;
    }

    async getPricePerGallon() {
        return 2.5;
    }
    async getTotalPrice() {
        const ppg = await this.getPricePerGallon();
        return ppg * this.gallons;
    }
}
module.exports = FuelPricing;
