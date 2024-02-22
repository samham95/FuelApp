import './QuoteHistoryStyles.css'

const FuelQuoteHistory = () => {
    return (
        <>
            <div className="pageTitle">
                <h1>Fuel History</h1>
            </div>
            <div className="fuelHistory">
                <table className="fuelTable">
                    <caption>Previous Fuel Quotes</caption>
                    <thead>
                        <tr>
                            <th>Gallons Requested</th>
                            <th>Delivery Address</th>
                            <th>Delivery Date</th>
                            <th>Suggested Price (per gallon)</th>
                            <th>Total Due</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>100</td>
                            <td>4300 Martin Luther King Blvd, Houston, TX 77204</td>
                            <td>10/12/23</td>
                            <td>$2.88</td>
                            <td>$288</td>
                        </tr>
                        <tr>
                            <td>88</td>
                            <td>4300 Martin Luther King Blvd, Houston, TX 77204</td>
                            <td>11/12/23</td>
                            <td>$2.51</td>
                            <td>$220.88</td>
                        </tr>
                        <tr>
                            <td>92</td>
                            <td>4300 Martin Luther King Blvd, Houston, TX 77204</td>
                            <td>12/12/23</td>
                            <td>$2.45</td>
                            <td>$225.4</td>
                        </tr>
                        <tr>
                            <td>150</td>
                            <td>4300 Martin Luther King Blvd, Houston, TX 77204</td>
                            <td>01/12/24</td>
                            <td>$2.65</td>
                            <td>$397.5</td>
                        </tr>
                        <tr>
                            <td>125</td>
                            <td>4300 Martin Luther King Blvd, Houston, TX 77204</td>
                            <td>02/12/24</td>
                            <td>$2.87</td>
                            <td>$358.75</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default FuelQuoteHistory; 