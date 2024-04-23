import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { client } from './apiClient';
import './styles.css';

const Register = () => {

    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validPassword, setValidPassword] = useState(false);
    const [validUsername, setValidUsername] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
        return regex.test(password);
    };

    const validateUsername = (username) => {
        const regex = /^[a-zA-Z][a-zA-Z0-9]{5,15}$/;
        return regex.test(username);
    }

    const submitRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        } else if (validPassword === false) {
            return;
        } else if (validUsername === false) {
            setErrorMessage('Username must be alphanumeric, between 5-15 characters, and start with a letter');
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
                    alert(`Registration failed - ${err.response.data}!`);
                } else {
                    console.error("Error during registration:", err);
                }
            });
    };

    return (
        <>
            <br />
            <br />
            <center>
                <h1>Register Here</h1>
                <br />
                <form onSubmit={submitRegister}>
                    <div className='container'>
                        <label className='label' htmlFor='user'>
                            Username:
                        </label>
                        <input
                            type='text'
                            id='user'
                            name='user'
                            placeholder='Username'
                            onChange={(e) => {
                                const { value } = e.target;
                                setUsername(value);

                                if (!validateUsername(value)) {
                                    setValidUsername(false);
                                    setErrorMessage("Username must be alphanumeric, between 5-15 characters, and begin with a letter")
                                } else {
                                    setErrorMessage("");
                                    setValidUsername(true);
                                }
                            }}
                            required
                            maxlength='50'
                        />
                        <br />
                        <label className='label mt-2' htmlFor='password'>
                            Password:
                        </label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            placeholder='Password'
                            onChange={
                                (e) => {
                                    const { value } = e.target;
                                    setPassword(value);

                                    if (!validatePassword(value)) {
                                        setValidPassword(false);
                                        setErrorMessage('Password must be 8-15 characters long and include at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*).');
                                    } else {
                                        setErrorMessage('');
                                        setValidPassword(true);
                                    }
                                }}
                            required
                            minlength='8'
                            maxlength='32'
                        />
                        <br />
                        <label className='label mt-2' htmlFor='confirmPassword'>
                            Confirm Password:
                        </label>
                        <input
                            type='password'
                            id='confirmPassword'
                            name='confirmPassword'
                            placeholder='Confirm Password'
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minlength='8'
                            maxlength='32'
                        />
                        <br />
                        <br />
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

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
