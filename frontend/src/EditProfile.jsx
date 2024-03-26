import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { client } from './apiClient';


const EditProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const username = localStorage.getItem('username');

    useEffect(() => {
        const checkAuthorizationAndFetchData = async () => {
            try {
                if (!localStorage.getItem('profileData')) {
                    const response = await client.get(`auth/profile/${username}`);
                    setProfileData(response.data);
                    localStorage.setItem('profileData', JSON.stringify(response.data));
                }
            } catch (err) {
                console.error("Authorization failed or failed to fetch profile data:", err);
                localStorage.clear();
                navigate('/login');
            }
        };

        checkAuthorizationAndFetchData();
    }, [navigate, username])
    const { needToCompleteProfile } = location.state || {};

    const initialProfileData = JSON.parse(localStorage.getItem('profileData')) || {
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
        try {
            await client.post(`auth/profile/${username}/edit`, profileData);
            localStorage.setItem('profileData', JSON.stringify(profileData));
            alert('Profile updated successfully!');
            navigate('/profile');
        } catch (err) {
            alert('Failed to update profile. Please try again.');
            console.error("Error updating profile:", err);
        }
    };

    return (
        <>
            {needToCompleteProfile && (
                <div className="flash-message">
                    Please complete your profile information.
                </div>
            )}
            <br />
            <center>
                <h1>Edit Profile</h1>
            </center>
            <div className='container'>
                <form onSubmit={handleSubmit}>
                    <label htmlFor='fullname'>Full Name:</label>
                    <input name='fullname' type='text' value={profileData.fullname} onChange={handleChange} required maxLength={50} />
                    <br />
                    <label htmlFor='street1'>Street Address:</label>
                    <input name='street1' type='text' value={profileData.street1} onChange={handleChange} required maxLength={50} />
                    <br />
                    <label htmlFor='street2'>Alternate Street Address:</label>
                    <input name='street2' type='text' value={profileData.street2} onChange={handleChange} placeholder='(optional)' maxLength={50} />
                    <br />
                    <label htmlFor='city'>City:</label>
                    <input name='city' type='text' value={profileData.city} onChange={handleChange} required maxLength={50} />
                    <br />
                    <label htmlFor='state'>State:</label>
                    <br />
                    <select name='state' value={profileData.state} onChange={handleChange} required>
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
                    <br />
                    <br />
                    <label htmlFor='zip'>Zip Code:</label>
                    <input name='zip' type='text' value={profileData.zip} onChange={handleChange} required minLength={5} maxLength={9} />
                    <br />
                    <button type='submit'>Save</button>
                </form>
            </div>
        </>
    );
};

export default EditProfile;
