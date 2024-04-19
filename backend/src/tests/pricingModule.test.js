const FuelPricing = require('../pricingModule.js');

describe('FuelPricing', () => {
    let fuelPricing;

    test('Test should create an instance with provided properties', () => {
        fuelPricing = new FuelPricing('TX', 100, true);

        expect(fuelPricing).toBeInstanceOf(FuelPricing);
        expect(fuelPricing.state).toBe('TX');
        expect(fuelPricing.gallons).toBe(100);
        expect(fuelPricing.quoteHistory = true);
    });

    test('Test that getPricePerGallon should return the price per gallon', async () => {
        fuelPricing = new FuelPricing('TX', 100, true);

        const pricePerGallon = await fuelPricing.getPricePerGallon();
        expect(pricePerGallon).toBe(1.71);
    });

    test('Test that rateFactor is 0 when there is no quote history', async () => {
        fuelPricing = new FuelPricing('TX', 100, false); // No quote history for user (false)
        expect(fuelPricing.quoteHistory = false);
        const pricePerGallon = await fuelPricing.getPricePerGallon();

        expect(pricePerGallon).toBe(1.725); // PPG should be this with all other factors the same
    });

    test('Test that gallonsFactor is 0.02 when gallons is > 1000', async () => {
        fuelPricing = new FuelPricing('TX', 1005, true); // No quote history for user (false)
        expect(fuelPricing.gallons = 1005);
        const pricePerGallon = await fuelPricing.getPricePerGallon();

        expect(pricePerGallon).toBe(1.695); // PPG should be this with all other factors the same
    });

    test('Test that locationFactor is 0.04 for any other state than TX', async () => {
        fuelPricing = new FuelPricing('RI', 100, true); // No quote history for user (false)
        expect(fuelPricing.state = 'RI');
        const pricePerGallon = await fuelPricing.getPricePerGallon();

        expect(pricePerGallon).toBe(1.74); // PPG should be this with all other factors the same
    })

    test('Test that getTotalPrice should return the total price based on gallons and price per gallon', async () => {
        fuelPricing = new FuelPricing('TX', 100, true);
        
        const totalPrice = await fuelPricing.getTotalPrice();
        expect(totalPrice).toBe(171); // 100 gallons * $2.5
    });
});
