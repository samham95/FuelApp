import { React } from 'react'
import { useNavigate } from 'react-router-dom'
import { client } from './apiClient'
import './styles.css'


const Logout = () => {
    const navigate = useNavigate()
    const handleLogout = async () => {
        try {
            const username = localStorage.getItem('username')
            const response = await client.post('/auth/logout', { username });
            localStorage.clear()
            navigate('/')
        } catch (error) {
            alert("Internal server error - unable to log you out!")
        }

    }

    return (
        <button className="btn btn-link navButton" onClick={handleLogout}>
            Log Out
        </button>
    )
}

export default Logout
