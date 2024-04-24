import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { client } from './apiClient';
import './styles.css';

const ProfileData = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthorizationAndFetchData = async () => {
            setIsLoading(true);
            try {
                const response = await client.get(`/auth/profile/${username}`);
                setProfileData(response.data);
            } catch (err) {
                if (err.response.status === 403 || err.response.status == 401) {
                    localStorage.clear();
                    navigate('/login')
                }
                else {
                    alert(`Unable to fetch profile data: ${err.response.data}`);
                    navigate('/')
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthorizationAndFetchData();
    }, []);



    useEffect(() => {
        const validateProfileData = () => {
            return profileData.fullname && profileData.street1 && profileData.state && profileData.zip && profileData.city;
        };

        if (!isLoading) {
            if (Object.keys(profileData).length == 0 || !validateProfileData()) {
                navigate('/profile/edit', { state: { needToCompleteProfile: true } });
            }
        }
    }, [profileData, navigate, isLoading]);


    return (
        <>
            <br />
            <div className="text-center fs-3">
                <h1>Welcome, {profileData.fullname}</h1>
            </div>
            <br />
            <div className="d-flex justify-content-center mb-4">
                <Link to="/quote/history" className="icon-btn mx-2">
                    <i className="fas fa-history"></i> Quote History
                </Link>
                <Link to="/quote" className="icon-btn mx-2">
                    <i className="fas fa-plus-square"></i> Add New Quote
                </Link>
            </div>


            <div className="container mt-5 mb-5">

                <div className='form-group'>
                    <label htmlFor='fullname'>Full Name:</label>
                    <input name='fullname' type='text' className="form-control" value={profileData.fullname || ''} readOnly />
                </div>
                <div className='form-group'>
                    <label htmlFor='street1'>Street Address:</label>
                    <input name='street1' type='text' className="form-control" value={profileData.street1 || ''} readOnly />
                </div>
                <div className='form-group'>
                    <label htmlFor='street2'>Apt, suite, etc.:</label>
                    <input name='street2' type='text' className="form-control" value={profileData.street2 || ''} readOnly />
                </div>
                <div className='form-group'>
                    <label htmlFor='city'>City:</label>
                    <input name='city' type='text' className="form-control" value={profileData.city || ''} readOnly />
                </div>
                <div className='form-group'>
                    <label htmlFor='state'>State:</label>
                    <input name='state' type='text' className="form-control" value={profileData.state || ''} readOnly />
                </div>
                <div className='form-group'>
                    <label htmlFor='zipcode'>Zip Code:</label>
                    <input name='zipcode' type='text' className="form-control" value={profileData.zip || ''} readOnly />
                </div>

                <div className="text-center mt-4">
                    <Link to='/profile/edit'><button type="submit" className="btn btn-primary">Edit Profile</button></Link>
                </div>
            </div>
        </>
    );
};

export default ProfileData;
