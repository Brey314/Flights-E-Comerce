import { useState} from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";
import './css/home.css'

const api="http://localhost:5000/api";
function App() {
  const { user, logout} = useAuth();
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [flights, setFlights] = useState([])
  const navigate=useNavigate()

  const [time, setTime] = useState('');
  const [category, setCategory] = useState('Economy');
  const [airline, setAirline] = useState('');
  const [direct, setDirect] = useState(false);

  const calculatePrice = (basePrice, selectedCategory) => {
    const multipliers = {
      'Economy': 1,
      'Business': 1.5,
      'First Class': 2
    };
    const multiplier = multipliers[selectedCategory] || 1;
    return (parseFloat(basePrice) * multiplier).toFixed(2);
  };

  const getAvailable = (flight, category) => {
    if(category==="Economy"){
      return flight.chairs;
    }else if(category==="Business"){
      return flight.chair_business;
    }else{
      return 0;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (date) params.append('date', date)
    if (time) params.append('time', time)
    if (airline) params.append('company', airline)
    if (direct) params.append('direct', "true")
    try {
      const response = await fetch(`${api}/flights?${params.toString()}`)
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

  const addToRecerved = async (flight) => {
    if (!user) {
      navigate("/login");
    } else {
      if(category==="First Class" || (flight.chairs===0 && category=="Economy") || (flight.chair_business===0 && category=="Business")){
        alert("There aren't chairs available");
        return;
      }
      try {
        const resflight = {
          idFlight: flight._id,
          cuantity: 1,
          category: category,
        };

        const resp = await fetch(`${api}/reservation`, {
          credentials: "include"
        });
        const data = await resp.json();
        if (!Array.isArray(data)) {
          console.error("Unexpected server response:", data);
        return;
        }
        const exist = data.find((item) => item.idFlight === resflight.idFlight && item.category === resflight.category);


        if (exist) {
          // If exist, add a new chair recerved
          const newCuantity = exist.chairs_reserved + 1;

          await fetch(`${api}/reservation/${exist._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chairs_reserved: newCuantity }),
            credentials: "include"
          });
        } else {
          // If don't exist, recerved
          await fetch(`${api}/reservation/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resflight),
            credentials: "include"
          });
        }
        navigate("/reservation")
        alert(`Flight from ${flight.from} to ${flight.to} recerved`);
      } catch (err) {
        console.error("Fail to send flight:", err);
      }
    }
  };


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
                <Link to="/reservation">
                  <img src="/assets/cart.png" alt="reservations" />
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
        <section className="results-container">
            <aside className="filters">
              <h3>Filters</h3>

              <input type="time" value={time} 
                onChange={(e) => setTime(e.target.value)} />

              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First Class">First Class</option>
              </select>

              <input type="text" 
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                placeholder="Airline" 
              />

              <label className="direct-checkbox">
                <input
                  type="checkbox"
                  checked={direct}
                  onChange={() => setDirect(!direct)}
                />
                Direct flights only
              </label>

              <button onClick={handleSearch} className="filter-btn">Apply Filters</button>
            </aside>
          <section className="results">
            <h2>Search Results</h2>
            {flights.length > 0 ? (
              flights.map(flight => (
                <div key={flight._id} className="flight-card">
                  <div >
                    <p><strong>From:</strong> {flight.from}</p>
                    <p><strong>To:</strong> {flight.to}</p>
                    {flight.scale1!=="" &&(
                      <p><strong>1 Scale in:</strong> {flight.scale1}</p>
                    )}
                    {flight.scale2 !== "" && (
                      <p><strong>2 Scale in:</strong> {flight.scale2}</p>
                    )}
                    {flight.scale3 !== "" && (
                      <p><strong>3 Scale in:</strong> {flight.scale3}</p>
                    )}
                    <p><strong>Date:</strong> {(() => {
                      const [year, month, day] = flight.flight_date.split('-');
                      return `${day}/${month}/${year}`;
                    })()}</p>
                    <p><strong>Time:</strong> {flight.flight_time}</p>
                    <p><strong>Price:</strong> ${calculatePrice(flight.price, category)}</p>
                    <p><strong>Company:</strong> {flight.company}</p>
                    <p><strong>Available:</strong> {getAvailable(flight, category)}</p>
                  </div>
                <button type="button" onClick={() => addToRecerved(flight)}>Book</button>
                </div>
              ))
            ) : (
              <p>No flights found.</p>
            )}
          </section>
        </section>
      </main>
    </>
  )
}

export default App
