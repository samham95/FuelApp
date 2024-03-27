import './QuoteHistoryStyles.css'
import { React, useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { client } from './apiClient';

const FuelQuoteHistory = () => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    const [quotes, SetQuotes] = useState([]);
    useEffect(() => {
        const checkAuthorizationAndFetchData = async () => {
            try {
                const response = await client.get(`auth/quote/history/${username}`);
                const quoteHistory = response.data.quotes;
                SetQuotes(quoteHistory);
            } catch (err) {
                if (err.response.status === 500) {
                    alert('Unable to get quotes')
                    navigate('/profile')
                }
                else if (err.response.status === 403) {
                    localStorage.clear();
                    navigate('/login');
                }

            }
        };
        checkAuthorizationAndFetchData();
    }, []);

    return (
        <>
            <div className="quote-history-page">
                <div className="pageTitle">
                    <h1 className="header1">Fuel Quote History</h1>
                </div>
                <table className="fuelTable">
                    <thead>
                        <tr>
                            <th className="text-center">Gallons Requested</th>
                            <th className="text-center">Delivery Address</th>
                            <th className="text-center">Delivery Date (YYYY-MM-DD)</th>
                            <th className="text-center">Suggested Price (per gallon)</th>
                            <th className="text-center">Total Due</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            quotes !== undefined && quotes.length > 0 ? (
                                quotes.map((q, indx) => {
                                    const address = `${q.address.street}, ${q.address.city}, ${q.address.state}, ${q.address.zip}`;
                                    return (
                                        <tr key={indx}>
                                            <td>{q.gallonsRequested}</td>
                                            <td>{address}</td>
                                            <td>{q.deliveryDate}</td>
                                            <td>{`$${q.suggestedPricePerGallon.toFixed(2)}`}</td>
                                            <td>{`$${q.totalDue.toFixed(2)}`}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="5">No quotes available</td></tr>
                            )
                        }

                    </tbody>
                </table>
            </div>
        </>
    );
}

export default FuelQuoteHistory; 