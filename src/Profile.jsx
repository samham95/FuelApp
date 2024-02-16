import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authClient } from './apiClient';
import './styles.css';

const ProfileData = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    const [profileData, setProfileData] = useState(() => {
        const cachedData = localStorage.getItem('profileData');
        return cachedData ? JSON.parse(cachedData) : {
            fullname: '',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
        };
    });


    useEffect(() => {
        const checkAuthorizationAndFetchData = async () => {
            try {
                const res = await authClient(token).post('/auth', { username, token });
                const auth = res.data.isAuthorized;

                if (!auth) {
                    throw new Error('Not authorized');
                }

                // Check if we need to fetch data or if it was loaded from cache
                if (!localStorage.getItem('profileData')) {
                    const response = await authClient(token).get(`/profile/${username}`);
                    setProfileData(response.data);
                    localStorage.setItem('profileData', JSON.stringify(response.data));
                }
            } catch (err) {
                console.error("Authorization check failed or failed to fetch profile data:", err);
                localStorage.clear();
                navigate('/login');
            }
        };

        checkAuthorizationAndFetchData();
    }, [navigate, token, username]);

    return (
        <>
            <br />
            <h1 className='header'>Welcome, {profileData.fullname}</h1>
            <br />
            <br />
            <div className='container'>
                <label className='label' htmlFor='fullname'>Full Name:</label>
                <input name='fullname' type='text' value={profileData.fullname || ''} readOnly={true} />
                <br />
                <label className='label' htmlFor='street1'>Street Address:</label>
                <input name='street1' type='text' value={profileData.street1 || ''} readOnly={true} />
                <label className='label' htmlFor='street2'>Alternate Street Address:</label>
                <input name='street2' type='text' value={profileData.street2 || ''} readOnly={true} />
                <label className='label' htmlFor='city'>City:</label>
                <input name='city' type='text' value={profileData.city || ''} readOnly={true} />
                <label className='label' htmlFor='state'>State:</label>
                <input name='state' type='text' value={profileData.state || ''} readOnly={true} />
                <label className='label' htmlFor='zipcode'>Zip Code:</label>
                <input name='zipcode' type='text' value={profileData.zip || ''} readOnly={true} />
                <h4>
                    <center>
                        <Link to='/profile/edit'>Edit Profile</Link>
                    </center>
                </h4>
            </div>
        </>
    );
};

export default ProfileData;
