import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Link ,useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import "./css/payInfo.css";


const api="http://localhost:5000/api";
export default function SuccessPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('payment_intent');
    console.log("SuccessPage loaded with id:", id);
    const [session, setSession] = useState(null);

    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout} = useAuth();
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        console.log(storedCart);
        setCart(storedCart);
    }, []);

    useEffect(() => {
        const fetchSession = async () => {
        try {
            console.log("DEBUG: Fetching payment intent details for ID:", id);
            const res = await fetch(`${api}/payment/session/${id}`);
            const data = await res.json();
            console.log("DEBUG: Received data:", data);
            if (user) {
                console.log("User:", user.user);
            }
            setSession(data);
        } catch (error) {
            console.error("Error loading session:", error);
            setSession({ error: "Failed to load payment details" });
        }
        };
        if (id) {
            fetchSession();
        } else {
            console.log("DEBUG: No payment_intent ID in URL");
            setSession({ error: "No payment ID provided" });
        }
    }, [id, user]);

    return (
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
                            Welcome, <strong>{user ? user.user : 'Guest'}</strong>
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

        <div className="page-container">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="paycard"
            >
                <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                className="icon-success"
                >
                ✓
                </motion.div>

                <h1 >¡Succes Pay!</h1>
                <p >Thank you for your purchase 😊</p>

                {session && !session.error ? (
                <div className="details-box">
                    {cart.map((item, index) => (
                        <div key={index} className="item-summary">
                            ____________________________________________________
                            <div className="summary-row">
                                <span className="label">Name:</span>
                                <span className="value">{item.from} to {item.to}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Category:</span>
                                <span className="value">{item.category}</span>
                            </div>

                            <div className="summary-row">
                                <span className="label">Chairs:</span>
                                <span className="value">{item.reserved_chairs}: {item.selectedSeats.join(', ')}</span>
                            </div>
                        </div>
                        ))}
                    <p><b>Total:</b> ${(session.amount / 100).toFixed(2)}</p>
                    <p><b>Status:</b> {session.status}</p>
                    <p className="redirect-msg">
                        Thank you for your purchase, please check your email.
                    </p>
                </div>
                ) : session && session.error ? (
                <div className="details-box">
                    <p className="error-text">Error: {session.error}</p>
                    <p className="redirect-msg">
                        There was an issue retrieving your payment details. Please contact support.
                    </p>
                </div>
                ) : (
                <p className="back-btnn">Loading Details...</p>
                )}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <Link className="back-btnn" to="/">Back to home</Link>
                </motion.div>
            </motion.div>


        </div>
        </>
    )
}