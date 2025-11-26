import "./css/userForm.css";
import { useState } from "react";
import { useNavigate ,Link} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const api=process.env.REACT_APP_API_URL;
export default function Login() {
  const [user, setuser] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resp = await fetch(`http://localhost:5000/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user, pass: password }),
        credentials: "include",
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      login(data.user);

      alert("Inicio de sesión exitoso");
      navigate("/");
    } catch (err) {
      alert(err.message || "Error en el inicio de sesión");
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
            <Link className="btnH" id="register-btn" to="/register"> Sign Up </Link>
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

  {/* Login Form */}
  <div className="containerLogin">
    <div className="login-form">
      <h1 className="title">Sign In</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="user">User:</label>
          <input
            type="text"
            id="user"
            name="user"
            placeholder="Your user"
            value={user}
            onChange={(e) => setuser(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Your password:"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Send
        </button>
      </form>

      <p className="register-link">
        ¿Don't have an account?{" "}
        <a href="/Register" className="link">
          Sing Up
        </a>
      </p>
    </div>
  </div>
</>
);
}