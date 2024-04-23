import { React, useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './styles.css'
import { client } from './apiClient';

const FuelQuoteForm = () => {

    const navigate = useNavigate();
    const username = localStorage.getItem('username')
    // today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    const maxDate = nextYear.toISOString().split('T')[0];

    const [gallonsRequested, setGallonsRequested] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [suggestedPricePerGallon, setSuggestedPricePerGallon] = useState(NaN);
    const [totalDue, setTotalDue] = useState(NaN);
    const [address, setAddress] = useState("");
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [disableSubmit, setDisableSubmit] = useState(true);
    const [disableQuote, setDisableQuote] = useState(true);
    const validateDeliveryDate = () => {
        return deliveryDate >= today && deliveryDate <= maxDate;
    }
    const validateGallonsRequested = () => {
        return Number.isFinite(Number.parseInt(gallonsRequested)) && Number.parseInt(gallonsRequested) > 0;
    }
    const validateQuote = () => {
        return Number.isFinite(totalDue) &&
            Number.isFinite(suggestedPricePerGallon) &&
            Number.isFinite(Number.parseInt(gallonsRequested));
    }
    useEffect(() => {
        setIsLoading(true);
        const checkAuthorizationAndFetchData = async () => {
            try {
                const response = await client.get(`auth/profile/${username}`);
                setProfileData(response.data);
            } catch (err) {
                if (err.response.status === 401 || err.response.status === 403) {
                    alert(`Unable to get fuel quotes: ${err.response.data}`)
                    localStorage.clear();
                    navigate('/login');
                } else {
                    alert(`Unable to get fuel quotes: ${err.response.data}`)
                    navigate('/profile')
                }

            } finally {
                setIsLoading(false);
            }
        };

        checkAuthorizationAndFetchData();
    }, [navigate, username]);



    useEffect(() => {
        const validateProfileData = () => {
            return profileData.fullname && profileData.street1 && profileData.state && profileData.zip && profileData.city;
        };
        if (!isLoading) {
            if (Object.keys(profileData).length == 0 || !validateProfileData()) {
                navigate('/profile/edit', { state: { needToCompleteProfile: true } });
            } else {
                const address = `${profileData.street1}\n${profileData.street2 ? profileData.street2 + '\n' : ''}${profileData.city}, ${profileData.state} ${profileData.zip}`;
                setAddress(address);
            }
        }


    }, [profileData, navigate, isLoading]);

    useEffect(() => {
        setDisableSubmit(!validateQuote());
    }, [suggestedPricePerGallon, totalDue]);
    useEffect(() => {
        setDisableQuote(!validateDeliveryDate() || !validateGallonsRequested());
    }, [gallonsRequested, deliveryDate])
    const handleQuote = async (e) => {
        e.preventDefault();
        try {
            const res = await client.get(`auth/quote/${username}/${gallonsRequested}`);
            const { pricePerGallon, totalPrice } = res.data;
            setSuggestedPricePerGallon(parseFloat(pricePerGallon));
            setTotalDue(parseFloat(totalPrice));
        } catch (err) {
            alert("Unable to get quote - please try again")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateQuote()) {
            alert("Please generate a valid quote before attempting to submit!");
            return;
        }
        try {
            const gallons = Number.parseInt(gallonsRequested);
            const res = await client.post('auth/quote', {
                username,
                street: `${profileData.street1}${profileData.street2 ? ' ' + profileData.street2 : ''}`,
                city: profileData.city,
                state: profileData.state,
                zip: profileData.zip,
                deliveryDate,
                gallonsRequested: gallons,
                suggestedPricePerGallon,
                totalDue
            });
            alert("Successfully saved your new quote!")
            navigate('/quote/history')
        } catch (err) {
            alert("Unable to save quote. Please try again later");
        }
    }
    return (
        <>
            <Link to="/profile" className="back-link">
                <i className="fas fa-arrow-left"></i>  Back to Profile
            </Link>
            <center>
                <h1>Fuel Quote Form</h1>
            </center>
            <br />
            <div className="d-flex justify-content-center mb-4">
                <Link to="/quote/history" className="icon-btn mx-2">
                    <i className="fas fa-history"></i> Quote History
                </Link>
                <Link to="profile/edit" className="icon-btn mx-2">
                    <i className="fas fa-edit"></i> Edit Delivery Address
                </Link>

            </div>
            <div className="container mt-3">
                <form onSubmit={handleQuote}>
                    <div className="form-group">
                        <label htmlFor="clientName">Client Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="clientName"
                            value={profileData.fullname}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="deliveryAddress">Delivery Address</label>
                        <textarea
                            type="text"
                            className="form-control"
                            id="deliveryAddress"
                            value={address}
                            readOnly
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gallonsRequested">Gallons Requested</label>
                        <input
                            type="number"
                            className="form-control"
                            id="gallonsRequested"
                            required
                            value={gallonsRequested}
                            min={1}
                            max={1000000000}
                            onChange={e => {
                                setGallonsRequested(e.target.value);
                                setSuggestedPricePerGallon(NaN);
                                setTotalDue(NaN);
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="deliveryDate">Delivery Date</label>
                        <input
                            type="date"
                            className="form-control"
                            id="deliveryDate"
                            min={today}
                            max={maxDate}
                            value={deliveryDate}
                            required
                            onChange={e => {
                                setDeliveryDate(e.target.value);
                                setSuggestedPricePerGallon(NaN);
                                setTotalDue(NaN);
                            }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={disableQuote}>GENERATE QUOTE</button>
                    <br />
                </form>
                <div className="my-3 border-top border-dashed custom-border-color"></div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="suggestedPrice">Suggested Price / gallon</label>
                        <input
                            type="text"
                            className="form-control"
                            id="suggestedPrice"
                            value={`$${suggestedPricePerGallon.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="totalAmountDue">Total Amount Due</label>
                        <input
                            type="text"
                            className="form-control"
                            id="totalAmountDue"
                            value={`$${totalDue.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={disableSubmit}>SUBMIT QUOTE</button>

                </form>
            </div>
        </>
    );
};

export default FuelQuoteForm;
