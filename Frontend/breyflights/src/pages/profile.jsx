import { useState} from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";
import './css/reservation.css'

function Profile() {
    const { user, logout} = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    return(
        <>
        <header className="header">
            <div className="container">
                <nav className="navbar">
                    <ul>
                    <li><Link className="btnH" to="/">Home</Link></li>
                    <li 
                        className="user-menu-container"
                        onMouseEnter={() => setOpen(true)}
                        onMouseLeave={() => setOpen(false)}
                    >
                        <a className="btnH">
                            Welcome, <strong>{user.user}</strong>
                        </a>
                        {user && open && (
                        <div className="user-dropdown">
                            <Link to="/profile" className="dropdown-item">Profile</Link>
                            <a onClick={async () => { await logout(); navigate("/"); }} className="dropdown-item">Sing Out</a>
                        </div>
                        )}
                    </li>
                    <li>
                        <Link to="/reservation">
                        <img src="/assets/cart.png" alt="reservations" />
                        </Link>
                    </li>
                    </ul>
                </nav>
            </div>
        </header>
        </>
    );
}

export default Profile;