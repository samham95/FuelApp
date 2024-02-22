import './QuoteHistoryStyles.css'
import { React, useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authClient } from './apiClient';

const FuelQuoteHistory = () => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    const [quotes, SetQuotes] = useState([]);
    useEffect(() => {
        const checkAuthorizationAndFetchData = async () => {
            try {
                const res = await authClient(token).post('/auth', { username });
                const auth = res.data.isAuthorized;

                if (!auth) {
                    throw new Error('Not authorized');
                }

                const response = await authClient(token).get(`/history/${username}`);
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
            <center>
                <div className="pageTitle">
                    <h1 className="header1">Fuel Quote History</h1>
                </div>
                <div className="fuelHistory">
                    <table className="fuelTable">
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
            </center>
        </>
    );
}

export default FuelQuoteHistory; 