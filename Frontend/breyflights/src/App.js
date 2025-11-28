import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from './pages/login';
import Register from './pages/register';
import Reservation from './pages/reservations';
import Profile from './pages/profile';
import { AuthProvider } from './context/AuthContext';
import Payment from './pages/payment';
import ProtectedRoute from "./components/ProtectedRoute";
import SuccessPage from "./pages/successPage";

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              <ProtectedRoute>
                <Login />
              </ProtectedRoute>
          } />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
          } />

          <Route 
            path="/reservation" 
            element={
              <ProtectedRoute>
                <Reservation />
              </ProtectedRoute>   
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>   
            } 
          />
          <Route 
            path="/success" 
            element={
            <ProtectedRoute>
                <SuccessPage />
            </ProtectedRoute>  
            } 
          />
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>  
              } 
            /> 

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
