import { React, useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authClient, client } from './apiClient'
import './styles.css'

const Login = () => {

    const navigate = useNavigate();
    const location = useLocation();


    const { registrationSuccess } = location.state || { registrationSuccess: false };
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        authClient(token).post('/auth', { username })
            .then((res) => {
                const auth = res.data.isAuthorized;
                if (auth) navigate('/profile');
            })
            .catch((err) => {
                return;
            })
    }, []);

    const loginSucess = (token) => {
        localStorage.clear()
        localStorage.setItem('token', token)
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
            .then((res) => {
                const token = res.data.token;
                loginSucess(token);
            })
            .catch((err) => {
                const status = err.response.status
                if (status === 400) {
                    alert('Login failed - incorrect credentials!')
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
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            maxlength = '50'
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
                            minlength = '8'
                            maxlength = '32'
                        />

                        <br />
                        <input
                            type='checkbox'
                            id='checked'
                            onChange={(e) => setIsChecked(e.target.value)}
                             />
                        Remember me
                        <br />
                        <br />
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