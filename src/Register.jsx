import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { client } from './apiClient';
import './styles.css';

const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const updateUsername = (e) => {
        setUsername(e.target.value);
    };

    const updatePassword = (e) => {
        setPassword(e.target.value);
    };

    const updateConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
    };

    const submitRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        await client.post('/register', { username, password })
            .then(() => {
                //alert('Registration successful!');
                localStorage.setItem("registrationSuccess", "true");
                navigate('/login', { state: { registrationSuccess: true } });
            })
            .catch((err) => {
                const status = err.response ? err.response.status : 500;
                if (status === 400) {
                    alert('Registration failed - please try again!');
                } else {
                    console.error("Error during registration:", err);
                }
            });
    };

    return (
        <>
            <br />
            <center>
                <h1>Register Here</h1>
                <form onSubmit={submitRegister}>
                    <div className='container'>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <label className='label' htmlFor='user'>
                            Username:
                        </label>
                        <input
                            type='text'
                            id='user'
                            name='user'
                            placeholder='Username'
                            onChange={updateUsername}
                            required
                        />
                        <br />
                        <label className='label' htmlFor='password'>
                            Password:
                        </label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            placeholder='Password'
                            onChange={updatePassword}
                            required
                        />
                        <br />
                        <label className='label' htmlFor='confirmPassword'>
                            Confirm Password:
                        </label>
                        <input
                            type='password'
                            id='confirmPassword'
                            name='confirmPassword'
                            placeholder='Confirm Password'
                            onChange={updateConfirmPassword}
                            required
                        />
                        <br />
                        <br />
                        <button type='submit'>
                            REGISTER
                        </button>
                        <br />
                        <h4>
                            Already have an account? <Link to='/login'> Login Here </Link>
                        </h4>
                    </div>
                </form>
            </center>
        </>
    );
};

export default Register;
