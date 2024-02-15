import { React } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from './apiClient'
import './styles.css'


const Logout = () => {
    const navigate = useNavigate()
    const handleLogout = async () => {
        const username = localStorage.getItem('username')
        const token = localStorage.getItem('token')

        const response = await authClient(token).post('/logout', { username });
        //console.log(response.status)
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
