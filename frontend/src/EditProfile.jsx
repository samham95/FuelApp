import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { client } from './apiClient';
import './styles.css'


const EditProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const username = localStorage.getItem('username');
    const [errorMessage, setErrorMessage] = useState("");
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        const checkAuthorizationAndFetchData = async () => {
            try {
                const response = await client.get(`auth/profile/${username}`);
                setProfileData(prevState => ({
                    ...prevState,
                    ...response.data,
                    street2: response.data.street2 || '',
                }));
            } catch (err) {
                console.error("Authorization failed or failed to fetch profile data:", err);
                localStorage.clear();
                navigate('/login');
            }
        };

        checkAuthorizationAndFetchData();
    }, [navigate, username])


    const { needToCompleteProfile } = location.state || {};

    const initialProfileData =
    {
        fullname: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
    };

    const [profileData, setProfileData] = useState(initialProfileData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");
        if (!/^[a-zA-Z\s]+$/.test(profileData.fullname)) {
            setErrorMessage("Invalid format for Full Name. Only letters and spaces are allowed.");
            return;
        }
        if (!/^[a-zA-Z0-9\s.,-]+$/.test(profileData.street1)) {
            setErrorMessage("Invalid format for Street Address. Only letters, numbers, spaces, commas, and hyphens are allowed.");
            return;
        }
        if (profileData.street2 && !/^[A-Za-z0-9#.\-\s/,]*$/.test(profileData.street2)) {
            setErrorMessage("Invalid format for Apt, suite, etc. Only letters, numbers, spaces, #, ., -, and / are allowed.");
            return;
        }
        if (!/^[a-zA-Z\s]+$/.test(profileData.city)) {
            setErrorMessage("Invalid format for City. Only letters and spaces are allowed.");
            return;
        }
        if (!/^\d{5}(?:-\d{4})?$/.test(profileData.zip)) {
            setErrorMessage("Invalid format for Zip Code. Should be 5 digits or 5 digits followed by a hyphen and 4 more digits.");
            return;
        }
        try {
            await client.post(`auth/profile/${username}/edit`, profileData);
            setShowOverlay(true);
            setTimeout(() => { setShowOverlay(false); navigate('/profile'); }, 1000);

        } catch (err) {
            if (err.response.status === 401 || err.response.status === 403) {
                localStorage.clear();
                navigate('/login');
            }
            else {
                alert(`Failed to update profile with error: ${err.response.data}`)
            }
        }
    };

    return (
        <>
            {
                showOverlay && (
                    <div className="overlay">
                        <div className="message-box">
                            Profile updated successfully!
                        </div>
                    </div>
                )
            }
            {needToCompleteProfile && (
                <div className="alert alert-danger text-center">
                    Please complete your profile information.
                </div>
            )}
            <Link to="/profile" className="back-link">
                <i className="fas fa-arrow-left"></i>  Back to Profile
            </Link>

            <center>
                <h1>Edit Your Profile</h1>
            </center>
            <div className="container mt-4 mb-5">
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className='form-group mb-3'>
                        <label htmlFor='fullname'>Full Name:</label>
                        <input name='fullname' type='text' className="form-control" value={profileData.fullname} onChange={handleChange} required maxLength={50} />
                    </div>
                    <div className='form-group mb-3'>
                        <label htmlFor='street1'>Street Address:</label>
                        <input name='street1' type='text' className="form-control" value={profileData.street1} onChange={handleChange} required maxLength={50} />
                    </div>
                    <div className='form-group mb-3'>
                        <label htmlFor='street2'>Apt, suite, etc.:</label>
                        <input name='street2' type='text' className="form-control" value={profileData.street2} onChange={handleChange} placeholder='(optional)' maxLength={50} />
                    </div>
                    <div className='form-group mb-3'>
                        <label htmlFor='city'>City:</label>
                        <input name='city' type='text' className="form-control" value={profileData.city} onChange={handleChange} required maxLength={50} />
                    </div>
                    <div className='form-group mb-3'>
                        <label htmlFor='state'>State:</label>
                        <div>
                            <select name='state' className="form-select" value={profileData.state} onChange={handleChange} required>
                                <option value='' ></option>
                                <option value='AL'>AL</option>
                                <option value='AK'>AK</option>
                                <option value='AR'>AR</option>
                                <option value='AZ'>AZ</option>
                                <option value='CA'>CA</option>
                                <option value='CO'>CO</option>
                                <option value='CT'>CT</option>
                                <option value='DC'>DC</option>
                                <option value='DE'>DE</option>
                                <option value='FL'>FL</option>
                                <option value='GA'>GA</option>
                                <option value='HI'>HI</option>
                                <option value='IA'>IA</option>
                                <option value='ID'>ID</option>
                                <option value='IL'>IL</option>
                                <option value='IN'>IN</option>
                                <option value='KS'>KS</option>
                                <option value='KY'>KY</option>
                                <option value='LA'>LA</option>
                                <option value='MA'>MA</option>
                                <option value='MD'>MD</option>
                                <option value='ME'>ME</option>
                                <option value='MI'>MI</option>
                                <option value='MN'>MN</option>
                                <option value='MO'>MO</option>
                                <option value='MS'>MS</option>
                                <option value='MT'>MT</option>
                                <option value='NC'>NC</option>
                                <option value='NE'>NE</option>
                                <option value='NH'>NH</option>
                                <option value='NJ'>NJ</option>
                                <option value='NM'>NM</option>
                                <option value='NV'>NV</option>
                                <option value='NY'>NY</option>
                                <option value='ND'>ND</option>
                                <option value='OH'>OH</option>
                                <option value='OK'>OK</option>
                                <option value='OR'>OR</option>
                                <option value='PA'>PA</option>
                                <option value='RI'>RI</option>
                                <option value='SC'>SC</option>
                                <option value='SD'>SD</option>
                                <option value='TN'>TN</option>
                                <option value='TX'>TX</option>
                                <option value='UT'>UT</option>
                                <option value='VT'>VT</option>
                                <option value='VA'>VA</option>
                                <option value='WA'>WA</option>
                                <option value='WI'>WI</option>
                                <option value='WV'>WV</option>
                                <option value='WY'>WY</option>
                            </select>
                        </div>
                    </div>
                    <div className='form-group mb-3'>
                        <label htmlFor='zip'>Zip Code:</label>
                        <input name='zip' type='text' className="form-control" value={profileData.zip} onChange={handleChange} required minLength={5} maxLength={10} />
                    </div>
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    <div className="text-center">
                        <button type='submit' className="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>

        </>
    );
};

export default EditProfile;
