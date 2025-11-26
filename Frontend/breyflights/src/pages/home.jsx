import { useState} from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";
import './css/home.css'

function App() {
  const { user, logout} = useAuth();
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [flights, setFlights] = useState([])

  const handleSearch = async (e) => {
    console.log(user);
    e.preventDefault()
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (date) params.append('date', date)
    console.log('Sending params:', params.toString())
    try {
      const response = await fetch(`http://localhost:5000/api/flights?${params.toString()}`)
      const data = await response.json()
      if (response.ok) {
        setFlights(data)
      } else {
        setFlights([])
      }
    } catch (error) {
      console.error('Error fetching flights:', error)
      setFlights([])
    }
  }

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
                
                {user ? (
                  <a className="btnH">
                    Welcome, <strong>{user.user}</strong>
                  </a>
                ) : (
                  <div>
                    <Link className="btnH" id="login-btn" to="/login"> Sign In </Link>
                    <Link className="btnH" id="register-btn" to="/register"> Sign Up </Link>
                  </div>
                )}

                {user && open && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <a onClick={logout} className="dropdown-item">Sing Out</a>
                  </div>
                )}
              </li>
              <li>
                <Link to="/shoppingcart">
                  <img src="/assets/cart.png" alt="Carrito de compras" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="container">
            <h1>Welcome to Brey Flights</h1>
            <p>Find the best flights for your next adventure</p>
          </div>
        </section>
        <section className="search">
            <h2>Search Flights</h2>
            <form onSubmit={handleSearch}>
              <input type="text" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From" />
              <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" />
              <input type="date" value={date} onChange={(e) => {
                const inputDate = e.target.value;
                if (inputDate) {
                  const dateObj = new Date(inputDate + 'T12:00:00');
                  const adjusted = dateObj.toISOString().split('T')[0];
                  setDate(adjusted);
                } else {
                  setDate('');
                }
              }} />
              <button type="submit">Search</button>
            </form>
        </section>
        <section className="results">
          <h2>Search Results</h2>
          {flights.length > 0 ? (
            flights.map(flight => (
              <div key={flight._id} className="flight-card">
                <p><strong>From:</strong> {flight.from}</p>
                <p><strong>To:</strong> {flight.to}</p>
                <p><strong>Date:</strong> {(() => {
                  const [year, month, day] = flight.flight_date.split('-');
                  return `${day}/${month}/${year}`;
                })()}</p>
                <p><strong>Time:</strong> {flight.flight_time}</p>
                <p><strong>Price:</strong> ${flight.price}</p>
                <p><strong>Company:</strong> {flight.company}</p>
                <p><strong>Chairs:</strong> {flight.chairs}</p>
              </div>
            ))
          ) : (
            <p>No flights found.</p>
          )}
        </section>
      </main>
    </>
  )
}

export default App
