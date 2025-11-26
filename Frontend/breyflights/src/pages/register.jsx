import { Link ,useNavigate} from "react-router-dom";
import { useState } from "react";
import "./css/userForm.css"; 

const api="http://localhost:5000/api";

function Register() {
    const navigate=useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [newUser, setNewUser] = useState({
    name: "",
    email:"",
    user: "",
    pass: "",
    rol: "Consumer",
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        setUsers([]);
        try {
            const answ = await fetch(`${api}/users`);
            if (!answ.ok) throw new Error(`Error HTTP: ${answ.status}`);
            const data = await answ.json();
            setUsers(data);
        } catch (err) {
            setError("Fail to load the users, Try again");
        } finally {
            setLoading(false);
        }
    };

    const saveNewUser = async () => {
        console.log("Starting saveNewUser with data:", newUser);
        try {
            const resp = await fetch(`${api}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
            });
            console.log("Fetch response status:", resp.status);
            if (!resp.ok) throw new Error("Fail to singin");

            const creado = await resp.json();
            console.log("User created successfully:", creado);
            setUsers((prev) => [...prev, creado]);
            setNewUser({ name: "",email:"", user: "", pass: "",rol: "Consumer" });
            navigate("/login");
        } catch (err) {
            console.error("Error in saveNewUser:", err.message);
            alert(" Can´t create the user");
        }
    };
    return (
    <>
        {/* Header */}
        <header className="header">
            <div className="container">
                <nav className="navbar">
                    <ul>
                        <li><Link className="btnH" to="/">Home</Link></li>
                        <li className="user-menu-container">
                            <Link className="btnH" id="register-btn" to="/login"> Sign In </Link>
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
            <div className="containerLogin">
                <div className="login-form">
                    <h1 className="title">Create your account</h1>

                    <form onSubmit={(e) => { e.preventDefault(); saveNewUser(); }}>
                        <div className="form-group">
                            <label htmlFor="name">Name:</label>
                            <input 
                                type="text" 
                                value={newUser.name}
                                id="name" 
                                name="User" 
                                onChange={(e) =>
                                setNewUser({ ...newUser, name: e.target.value })
                                }
                                placeholder="Tu Name" 
                                required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input 
                                type="text" 
                                value={newUser.email}
                                id="email" 
                                name="email" 
                                onChange={(e) =>
                                setNewUser({ ...newUser, email: e.target.value })
                                }
                                placeholder="Your email" 
                                required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="user">user:</label>
                                <input 
                                type="text" 
                                value={newUser.user}
                                id="user" 
                                name="user" 
                                onChange={(e) =>
                                setNewUser({ ...newUser, user: e.target.value })
                                }
                                placeholder="Your user" 
                                required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input 
                                type="password" 
                                value={newUser.pass}
                                id="password" 
                                name="password" 
                                onChange={(e) =>
                                setNewUser({ ...newUser, pass: e.target.value })
                                }
                                placeholder="Your Password" 
                                required />
                        </div>
                        <button type="submit" className="submit-btn">Send</button>
                    </form>

                    <p className="register-link">
                    ¿Already have an account? <Link to="/Login" className="link">Sign In Here</Link>
                    </p>
                </div>
            </div>
        </main>
        </>
    );
}

export default Register;
