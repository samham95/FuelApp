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
        if (!token) {
            localStorage.clear();
            navigate('/login');
        } else {
            const fetchData = async () => {
                try {
                    const response = await authClient(token).get(`/profile/${username}`);
                    setProfileData(response.data);
                    // Cache the fetched data in localStorage
                    localStorage.setItem('profileData', JSON.stringify(response.data));
                } catch (err) {
                    const status = err.response ? err.response.status : 500;
                    if (status === 403) {
                        alert('Forbidden! Authentication Failed');
                        navigate('/login');
                    }
                    console.error("Failed to fetch profile data:", err);
                }
            };

            // Check if we need to fetch data or if it was loaded from cache
            if (!localStorage.getItem('profileData')) {
                fetchData();
            }
        }
    }, [navigate, token, username]);

    return (
        <>
            <br />
            <center>
                <h1 className='h1'>PROFILE</h1>
            </center>
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
