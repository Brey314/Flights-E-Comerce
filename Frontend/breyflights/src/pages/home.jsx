import { useState} from 'react'
import { Link } from 'react-router-dom'
import './css/home.css'

function App() {
  const [open, setOpen] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [flights, setFlights] = useState([])

  const logout = () => {
    setUsuario(null)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (date) params.append('date', date)
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
                className="usuario-menu-container"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                {usuario ? (
                  <a className="btnH">
                    Welcome, <strong>{usuario.user}</strong>
                  </a>
                ) : (
                  <div>
                    <Link className="btnH" id="login-btn" to="/login"> Login </Link>
                    <Link className="btnH" id="register-btn" to="/register"> Register </Link>
                  </div>
                )}

                {usuario && open && (
                  <div className="usuario-dropdown">
                    <Link to="/profile" className="dropdown-item">Perfil</Link>
                    <button onClick={logout} className="dropdown-item">Cerrar sesión</button>
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
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
                <p><strong>Date:</strong> {new Date(flight.flight_date).toLocaleDateString()}</p>
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
