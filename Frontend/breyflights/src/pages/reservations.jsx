import { useEffect,useState} from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";
import './css/reservation.css'

const api="http://localhost:5000/api";

function Reservation() {
    const { user, logout} = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState([]);
    const [flight, setFlight] = useState([]);

    const [subtotal, setSubtotal] = useState(0);
    const [cuantity, setCantidad] = useState(0);

    const getPriceMultiplier = (category) => {
        switch (category) {
          case 'Business': return 1.5;
          case 'First Class': return 2;
          default: return 1;
        }
      };

    const getAvailable = (chairs, category) => {
        const percentages = {
          'Economy': 0.75,
          'Business': 0.20,
          'First Class': 0.025
        };
        return Math.round(chairs * percentages[category]);
      };

    const deleteOfResevations = async (idFlight) => {
        try {
            const response = await fetch(`${api}/reservation/${idFlight}`, {
            method: "DELETE",
            credentials: "include"
            });
            if (!response.ok) {
                throw new Error(`Delete failed with status ${response.status}`);
            }
            setReservation((prevReservation) => prevReservation.filter((reservation) => reservation._id !== idFlight));
            setFlight((prevFlight) => {
                const newFlight = prevFlight.filter((item) => item._id !== idFlight);
                calculateTikets(newFlight);
                return newFlight;
            });
        } catch (err) {
            console.error("Error eliminando reserva:", err);
        }
    };

    const changeChairs = async (idFlight, reserved_chairs, op, item) => {
        try {
            let newcuantity = reserved_chairs;
            const available = getAvailable(item.chairs, item.category);
            if (op === "+") {
                if (newcuantity >= available) {
                    return;
                }
                newcuantity++;
            } else if (reserved_chairs > 1) newcuantity--;
            else if (reserved_chairs==="charis") return;
            else {
                deleteOfResevations(idFlight);
            return;
            }
            await fetch(`${api}/reservation/${idFlight}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chairs_reserved: newcuantity }),
                credentials: "include"
            });

            setReservation((prevCart) => {
                const newReservation = prevCart.map((reservation) =>
                reservation._id === idFlight ? { ...reservation, reserved_chairs: newcuantity } : reservation
            );
            return newReservation;
        });

        // Update flight state for UI
        setFlight((prevFlight) => {
            const newFlight = prevFlight.map((item) =>
            item._id === idFlight ? { ...item, reserved_chairs: newcuantity } : item
            );
            calculateTikets(newFlight);
            return newFlight;
        });
        } catch (err) {
            console.error("Error changing  quantity", err);
        }
    };

    const calculateTikets = (tikets) => {
        let sumPrice = 0;
        let sumCuantity = 0;
        if (tikets && tikets.length > 0) {
        tikets.forEach((item) => {
            const multiplier = getPriceMultiplier(item.category);
            sumPrice += (item.price * multiplier) * item.reserved_chairs;
            sumCuantity += item.reserved_chairs;
        });
        }
        setSubtotal(sumPrice);
        setCantidad(sumCuantity);
    };

    const checkout = () => {
        if (flight.length === 0) {
            alert("There's aren't flights reserved");
            return;
        }

        // Guardas el carrito para usarlo en /payment
        localStorage.setItem("cart", JSON.stringify(flight));

        // Rediriges a tu página interna de pago (stripe elements)
        navigate("/payment");
    };

    useEffect(() => {
        const loadReservations = async () => {
            try {
                const answ = await fetch(`${api}/reservation`, {
                    credentials: "include"
                });
                const data = await answ.json();
                setReservation(data);

                const answ2 = await fetch(`${api}/flights`, {
                    credentials: "include"
                });
                const data2 = await answ2.json();

                let mergedReservations = [];
                for(const items of data){
                    const flight = data2.find(f => f._id === items.idFlight);
                    if(flight){
                        mergedReservations.push({ ...flight, ...items, _id: items._id, reserved_chairs: items.chairs_reserved });
                    } else {
                        console.log("Reservations: No flight found for idFlight:", items.idFlight);
                    }
                }
                setFlight(mergedReservations);
                calculateTikets(mergedReservations);
            } catch (err) {
                console.error("Reservations: Error loading reservations:", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            loadReservations();
        }
    }, [user]);
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
        <main className='page-layout'>
            <div id="flights">
            {loading && <p className="info">Loading Reservations...</p>}
            {!loading && flight.length === 0 && (
              <p className="info">There are no reservations.</p>
            )}
            {flight.map((item) => {
              return (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                    <h3>From: {item.from}</h3>
                    <h3>To: {item.to}</h3>
                </div>

                <div className="cart-item-info">
                  <h3>Company: {item.company}</h3>
                  <p className="category">Category: {item.category}</p>
                  <p className="price">USD {(item.price * getPriceMultiplier(item.category)).toFixed(2)} $, per person</p>
                  <p className="available">Available: {getAvailable(item.chairs, item.category)}</p>

                  <div className="cart-item-actions">
                    <div className="quantity">
                        <h3>Chairs: </h3>
                      <button
                        onClick={() => changeChairs(item._id, item.reserved_chairs, "-", item)}
                      >
                        -
                      </button>
                      <span>{item.reserved_chairs}</span>
                      <button
                        onClick={() => changeChairs(item._id, item.reserved_chairs, "+", item)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => deleteOfResevations(item._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
            </div>
            <div className="summary-sidebar">
                <div className="subtotal">
                    <div className="text">
                    <h2>
                        Subtotal ({cuantity} tikets):
                    </h2>
                    <h1>USD {subtotal.toLocaleString()} $</h1>
                    </div>
                    <button className="pay" onClick={checkout} >Proceed to payment</button>
                </div>
            </div>
        </main>
        </>
    );
}

export default Reservation;