import { React } from 'react'
import { useNavigate } from 'react-router-dom'
import { client } from './apiClient'
import './styles.css'


const Logout = () => {
    const navigate = useNavigate()
    const handleLogout = async () => {
        const username = localStorage.getItem('username')
        const response = await client.post('/logout', { username });
        localStorage.clear()
        navigate('/')
    }

    return (
        <button className="btn btn-link navButton" onClick={handleLogout}>
            Log Out
        </button>
    )
}

export default Logout
