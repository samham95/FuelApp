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
                        {errorMessage && <p className="error-message" style={{ color: "red" }}>{errorMessage}</p>}
                        <label className='label' htmlFor='user'>
                            Username:
                        </label>
                        <input
                            type='text'
                            id='user'
                            name='user'
                            placeholder='Username'
                            onChange={(e) => setUsername(e.target.value)}
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
                            onChange={(e) => setPassword(e.target.value)}
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
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
            </center >
        </>
    );
};

export default Register;
