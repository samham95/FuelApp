import './QuoteHistoryStyles.css'
import { React, useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { client } from './apiClient';


const FuelQuoteHistory = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const [quotes, SetQuotes] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        const checkAuthorizationAndFetchData = async () => {
            try {
                const response = await client.get(`auth/quote/history/${username}`);
                const quoteHistory = response.data.quotes;
                SetQuotes(quoteHistory);
            } catch (err) {
                if (err.response.status === 401 || err.response.status === 403) {
                    alert(`Unable to get quotes: ${err.response.data}`)
                    localStorage.clear();
                    navigate('/login');
                }
                else {
                    alert(`Unable to get quotes: ${err.response.data}`)
                    navigate('/profile')
                }
            }
        };
        checkAuthorizationAndFetchData();
    }, [username, navigate]);

    const sortedQuotes = useMemo(() => {
        if (!quotes) return [];
        return [...quotes].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [quotes, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };


    return (
        <>
            <Link to="/profile" className="back-link">
                <i className="fas fa-arrow-left"></i>  Back to Profile
            </Link>
            <div className="quote-history-page">
                <div className="pageTitle">
                    <h1 className="header1">Fuel Quote History</h1>
                </div>
                <table className="fuelTable mt-3">
                    <thead>
                        <tr>
                            <th className="text-center">Delivery Address</th>
                            <th className="text-center" onClick={() => requestSort('gallonsRequested')}>
                                <span className='header-text'> Gallons Requested</span>
                                {sortConfig.key === 'gallonsRequested' ? (
                                    <i className={`sort-icon fas ${sortConfig.direction === 'descending' ? 'fa-arrow-down' : 'fa-arrow-up'} ms-2`}></i>
                                ) : null}
                            </th>
                            <th className="text-center" onClick={() => requestSort('deliveryDate')}>
                                Delivery Date (YYYY-MM-DD)
                                {sortConfig.key === 'deliveryDate' ? (
                                    <i className={`sort-icon fas ${sortConfig.direction === 'descending' ? 'fa-arrow-down' : 'fa-arrow-up'} ms-2`}></i>
                                ) : null}
                            </th>
                            <th className="text-center" onClick={() => requestSort('suggestedPricePerGallon')}>
                                Suggested Price (per gallon)
                                {sortConfig.key === 'suggestedPricePerGallon' ? (
                                    <i className={`sort-icon fas ${sortConfig.direction === 'descending' ? 'fa-arrow-down' : 'fa-arrow-up'} ms-2`}></i>
                                ) : null}
                            </th>
                            <th className="text-center" onClick={() => requestSort('totalDue')}>
                                Total Due
                                {sortConfig.key === 'totalDue' ? (
                                    <i className={`sort-icon fas ${sortConfig.direction === 'descending' ? 'fa-arrow-down' : 'fa-arrow-up'} ms-5`}></i>
                                ) : null}
                            </th>

                        </tr>
                    </thead>
                    <tbody>
                        {sortedQuotes !== undefined && sortedQuotes.length > 0 ? (
                            sortedQuotes.map((q, indx) => {
                                const address = `${q.address.street}, ${q.address.city}, ${q.address.state}, ${q.address.zip}`;
                                return (
                                    <tr key={indx}>
                                        <td>{address}</td>
                                        <td>{q.gallonsRequested}</td>
                                        <td>{q.deliveryDate}</td>
                                        <td>{`$${q.suggestedPricePerGallon.toFixed(2)}`}</td>
                                        <td>{`$${q.totalDue.toFixed(2)}`}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="5">No quotes available</td></tr>
                        )}
                        <tr className="add-quote-row">
                            <td colSpan="5" className="text-center">
                                <Link to="/quote" className="add-quote-link">+ Add New Quote</Link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default FuelQuoteHistory;
