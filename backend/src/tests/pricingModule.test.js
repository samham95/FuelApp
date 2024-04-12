const FuelPricing = require('../pricingModule.js');

describe('FuelPricing', () => {
    let fuelPricing;

    beforeEach(() => {
        fuelPricing = new FuelPricing('user123', 'TX', 100);
    });

    test('Test should create an instance with provided properties', () => {
        expect(fuelPricing).toBeInstanceOf(FuelPricing);
        expect(fuelPricing.username).toBe('user123');
        expect(fuelPricing.state).toBe('TX');
        expect(fuelPricing.gallons).toBe(100);
    });

    test('Test that getPricePerGallon should return the price per gallon', async () => {
        const pricePerGallon = await fuelPricing.getPricePerGallon();
        expect(pricePerGallon).toBe(2.5);
    });

    test('Test that getTotalPrice should return the total price based on gallons and price per gallon', async () => {
        const totalPrice = await fuelPricing.getTotalPrice();
        expect(totalPrice).toBe(250); // 100 gallons * $2.5
    });
});
