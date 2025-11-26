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


    const deleteOfResevations = async (idFlight) => {
        try {
            await fetch(`${api}/reservation/${idFlight}`, {
            method: "DELETE",
            credentials: "include"
            });
            setReservation((prevReservation) => prevReservation.filter((reservation) => reservation.idFlight !== idFlight));
            setFlight((prevFlight) => {
                const newFlight = prevFlight.filter((item) => item.idFlight !== idFlight);
                calculateTikets(newFlight);
                return newFlight;
            });
        } catch (err) {
            console.error("Error eliminando reserva:", err);
        }
    };

    // Cambiar cantidad
    const changeChairs = async (idFlight, reserved_chairs, op, total_chairs) => {
        try {
            let newcuantity = reserved_chairs;
            if (op === "+") {
                if (newcuantity >= total_chairs) {
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
                reservation.idFlight === idFlight ? { ...reservation, chairs_reserved: newcuantity } : reservation
            );
            calculateTikets()
            return newReservation;
        });

        // Update flight state for UI
        setFlight((prevFlight) => {
            const newFlight = prevFlight.map((item) =>
            item.idFlight === idFlight ? { ...item, reserved_chairs: newcuantity } : item
            );
            calculateTikets(newFlight);
            return newFlight;
        });
        } catch (err) {
            console.error("Error cambiando cantidad", err);
        }
    };

    const calculateTikets = (tikets) => {
    let sumPrice = 0;
    let sumCuantity = 0;
    if (tikets && tikets.length > 0) {
      tikets.forEach((item) => {
        sumPrice += item.price * item.reserved_chairs;
        sumCuantity += item.reserved_chairs;
      });
    }
    setSubtotal(sumPrice);
    setCantidad(sumCuantity);
  };

    useEffect(() => {
        console.log("Reservations: useEffect triggered, user:", user);
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
                        mergedReservations.push({ ...items, ...flight, reserved_chairs: items.chairs_reserved });
                    } else {
                        console.log("Reservations: No flight found for idFlight:", items.idFlight);
                    }
                }
                console.log("Reservations: Total merged reservations:", mergedReservations.length);
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
                  <p className="price">USD {item.price} $, per person</p>
                  <p className="available">Available: {item.chairs - item.reserved_chairs}</p>

                  <div className="cart-item-actions">
                    <div className="quantity">
                        <h3>Chairs: </h3>
                      <button
                        onClick={() => changeChairs(item.idFlight, item.reserved_chairs, "-", item.chairs)}
                      >
                        -
                      </button>
                      <span>{item.reserved_chairs}</span>
                      <button
                        onClick={() => changeChairs(item.idFlight, item.reserved_chairs, "+", item.chairs)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => deleteOfResevations(item.idFlight)}
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
                    <button className="pay" >Proceed to payment</button>
                </div>
            </div>
        </main>
        </>
    );
}

export default Reservation;