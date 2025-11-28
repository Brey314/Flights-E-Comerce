import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, useEffect} from "react";
import { Link,useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";
import './css/payment.css'

const getPriceMultiplier = (category) => {
  switch (category) {
    case 'Business': return 1.5;
    case 'First Class': return 2;
    default: return 1;
  }
};

export default function CheckoutForm() {

  const { user, logout} = useAuth();
  const [open, setOpen] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);


  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/success"
      }
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      localStorage.removeItem('paymentClientSecret');
    }

    setLoading(false);
  };

  useEffect(() => {
    let timer;
    
    const resetTimer = () => {
      clearTimeout(timer);
      
      timer = setTimeout(() => {
        alert("Your sesión has been expired due to inactivity");
        logout();
        window.location.href = "/login"; 
      }, 15*1000*60);
    };

    window.addEventListener("keypress", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("click", resetTimer);
      clearTimeout(timer);
    };
  }, []);

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
    <div className="checkout-wrapper">
  {/* ----- TARJETA IZQUIERDA: RESUMEN DE COMPRA ----- */}
      <div className="summary-card">
        <h3>Summary of your purchase</h3>

        {cart.map((item, index) => (
          <div key={index} className="item-summary">
            ____________________________________________________
            <div className="summary-row">
              <span className="label">Name:</span>
              <span className="value">{item.from} to {item.to}</span>
            </div>
            <div className="summary-row">
              <span className="label">Seats:</span>
              <span className="value">{item.category}: {item.selectedSeats.join(', ')}</span>
            </div>

            <div className="summary-row">
              <span className="label">Chairs:</span>
              <span className="value">{item.reserved_chairs}</span>
            </div>

            <div className="summary-row">
              <span className="label">Subtotal:</span>
              <span className="value">${(item.price * getPriceMultiplier(item.category) * item.reserved_chairs).toFixed(2)}</span>
            </div>
          </div>
        ))}

        <div className="summary-row total">
          <span className="label">Total:</span>
          <span className="value">${cart.reduce((sum, item) => sum + (item.price * getPriceMultiplier(item.category) * item.reserved_chairs), 0).toFixed(2)}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="payment-container">
        <h2 className="payment-title">Secure Pay</h2>

        <div className="payment-box">
          <PaymentElement />
        </div>

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <button className="pay-button" disabled={!stripe || loading}>
          {loading ? "Procesing..." : "Pay now"}
        </button>
      </form>
    </div>
    </>
  );
}
