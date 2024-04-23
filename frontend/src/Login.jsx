import { React, useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { client } from './apiClient'
import './styles.css'

const Login = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [errorMessage, setErrorMessage] = useState("");
    const { registrationSuccess } = location.state || { registrationSuccess: false };
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const username = localStorage.getItem('username');
        client.post('/auth', { username })
            .then(() => {
                navigate('/profile');
            })
            .catch(() => {
                return;
            })
    }, []);

    const loginSucess = () => {
        localStorage.clear()
        localStorage.setItem('username', username)
        localStorage.setItem('rememberme', isChecked)
        if (registrationSuccess === true) {
            localStorage.removeItem('registrationSuccess');
            navigate('/profile/edit', { state: { needToCompleteProfile: true } });
        } else {
            navigate('/profile');
        }
    }

    const submitLogin = async (e) => {
        e.preventDefault()
        await client.post('/login', { username, password, isChecked })
            .then(() => {
                loginSucess();
            })
            .catch((err) => {
                const status = err.response.status
                if (status === 401) {
                    setErrorMessage('Login failed - incorrect credentials!')
                }
            })
    }

    return (
        <>
            {registrationSuccess && (
                <div className="flash-message">
                    Initial registration successful, please sign in to complete your registration.
                </div>
            )}
            <br />
            <br />
            <center>
                <h1 > Login Here</h1>
                <br />
                <form onSubmit={submitLogin}>
                    <div className='container'>
                        <label className='label' htmlFor='user'>
                            Username:
                        </label>
                        <input
                            type='text'
                            id='user'
                            name='user'
                            placeholder='Username'
                            onChange={(e) => { setUsername(e.target.value); setErrorMessage('') }}
                            required
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
                            onChange={(e) => { setPassword(e.target.value); setErrorMessage('') }}
                            required
                        />

                        <br />
                        <input
                            type='checkbox'
                            id='checked'
                            onChange={(e) => setIsChecked(e.target.value)}
                        />
                        &nbsp;Remember me
                        <br />
                        <br />
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                        <button type='submit' onSubmit={submitLogin}>
                            LOGIN
                        </button>

                        <br />
                        <h4>
                            Need to Register? <Link to='/register'> Click Here </Link>
                        </h4>
                    </div>
                </form>
            </center>
        </>
    )
}
export default Login;