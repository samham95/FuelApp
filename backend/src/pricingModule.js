class FuelPricing {
    constructor(state, gallons, quoteHistory) {
        this.state = state;
        this.gallons = gallons;
        this.quoteHistory = quoteHistory;
        this.currentPPG = 1.5;
    }

    getPricePerGallon() {
        const rateFactor = this.quoteHistory ? 0.02 : 0.04;
        const gallonsFactor = this.gallons > 1000 ? 0.02 : 0.03;
        const locationFactor = this.state === 'TX' ? 0.02 : 0.04;
        return this.currentPPG * (rateFactor - gallonsFactor + locationFactor + 1);
    }
    getTotalPrice() {
        return this.getPricePerGallon() * this.gallons;
    }
}
module.exports = FuelPricing;
