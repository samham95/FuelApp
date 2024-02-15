import { React, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logout from './Logout';
import './styles.css';

const Navbar = () => {
    let location = useLocation()
    const token = localStorage.getItem('token');
    const initState = token === 'null';
    const [activeSession, setActiveSession] = useState(initState)
    useEffect(() => {
        let currState = localStorage.getItem('token');
        if (currState) setActiveSession(true)
        else setActiveSession(false)
    }, [location])

    if (activeSession) {
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark my-navbar-dark">
                    <Link className="navbar-brand" to="/">
                        <img src="/fuel_logo.png" width="40" height="40" alt="" />
                    </Link>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <Link className="nav-link navLink" to="/">Home <span className="sr-only">(current)</span></Link>
                            </li>
                            <li className="nav-item active">
                                <Link className="nav-link navLink" to="/">About</Link>
                            </li>
                            <li className="nav-item dropdown active">
                                <a className="nav-link dropdown-toggle navLink" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Profile
                                </a>
                                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <Link className="dropdown-item navLink" to="/profile">My Profile</Link>
                                    <div className="dropdown-divider"></div>
                                    <Link className="dropdown-item navLink" to="/">New Fuel Quote</Link>
                                    <Link className="dropdown-item navLink" to="/">Quote History</Link>
                                </div>
                            </li>
                        </ul>
                        <div className="ml-auto">
                            <Logout />
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
    else {
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark my-navbar-dark">
                    <Link className="navbar-brand" to="/">
                        <img src="/fuel_logo.png" width="40" height="40" alt="" />
                    </Link>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <Link className="nav-link navLink" to="/">Home <span className="sr-only">(current)</span></Link>
                            </li>
                            <li className="nav-item active">
                                <Link className="nav-link navLink" to="/login">Login</Link>
                            </li>
                            <li className="nav-item active">
                                <Link className="nav-link navLink" to="/register">Register</Link>
                            </li>

                        </ul>
                    </div>
                </nav>
            </div>
        )
    }
};

export default Navbar;
