import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Homepage from './Homepage';
import AssetList from './AssetList';
import AssetSurrender from './AssetSurrender';
import RequestHistory from './RequestHistory';
import Accessories from './Accessories';
import AssetTransfer from './AssetTransfer';
import './App.css';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [client, setClient] = useState(1);
  const [cpf, setCpf] = useState('');

  return (
    <AuthContext.Provider value={{ username, setUsername, client, setClient, cpf, setCpf }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

function Login() {
  const { username, setUsername, client, setClient, setCpf } = useAuth();
  const [password, setPassword] = useState('');
  const [clientname, setClientName] = useState('Username:');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (client == 1) {
      setCpf(username);
    }
    const credentials = { username, password };
    const response = await fetch('http://172.16.250.247:5000/api/authentication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client, credentials }),
    });

    const data = await response.json();
    if (data.auth == 1) {
      setError('');
      setSuccessMessage('Login Successful!');
      setTimeout(() => {
        navigate(`/homepage?client=${encodeURIComponent(client)}`);
      }, 1000);
    } else {
      console.log(data);
      setError("Invalid Credentials");
      setSuccessMessage('');
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center">
      <h2 className="mt-5">NTPL ASSET MANAGEMENT SYSTEM</h2>
      <img className='ntpl-logo' src={`${process.env.PUBLIC_URL}/NTPL_logo.png`} alt="My Image" />
      {successMessage && (
        <div className="custom-alert" role="alert">
          {successMessage}
        </div>
      )}
      <div className="login-container w-100 mt-4">
        <div className="login-form border p-4 rounded bg-light shadow">
          <h1 className="text-center">Login</h1>
          <div className="d-flex justify-content-around mb-3">
            <button
              className={`btn btn-outline-primary ${client === 1 ? 'active' : ''}`}
              onClick={() => { setClient(1); setClientName('Username:'); }}
            >
              User
            </button>
            <button
              className={`btn btn-outline-primary ${client === 2 ? 'active' : ''}`}
              onClick={() => { setClient(2); setClientName('Administrator Name:'); }}
            >
              Admin
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">{clientname}</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password:</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <p className="text-danger">{error}</p>}
            <button className='btn btn-primary w-100' type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const { client, cpf } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-custom navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="d-flex align-items-center" onClick={() => navigate(`/homepage?client=${encodeURIComponent(client)}`)}>
          <img className='ntpl-logo-navbar' src={`${process.env.PUBLIC_URL}/NTPL_logo.png`} alt="Logo" />
          <h1 className="navbar-brand mb-0">Welcome to NTPL IT Asset Management</h1>
        </div>
        <div>
          <ul className="navbar-nav">
            <li className="nav-item nav-btn">
              <a className="nav-link" onClick={() => navigate('/assetList')}>Assets List</a>
            </li>
            <li className="nav-item nav-btn">
              <a className="nav-link" onClick={() => navigate('/assetSurrender', { state: cpf })}>IT Surrender</a>
            </li>
            <li className="nav-item nav-btn">
              <a className="nav-link" onClick={() => navigate('/assetTransfer')}>IT Transfer</a>
            </li>
            <li className="nav-item nav-btn">
              <a className="nav-link" onClick={() => navigate('/accessories')}>Accessories</a>
            </li>
            <li className="nav-item nav-btn">
              <a className="nav-link" onClick={() => navigate('/requestHistory', { state: cpf })}>
                {client === 1 ? "Request History" : "Surrender Requests"}
              </a>
            </li>
            <li className="nav-item nav-btn">
              <a className="nav-link" onClick={() => navigate('/')}>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/homepage" element={<><Navbar /><Homepage /></>} />
          <Route path="/assetList" element={<><Navbar /><AssetList /></>} />
          <Route path="/assetSurrender" element={<><Navbar /><AssetSurrender /></>} />
          <Route path="/requestHistory" element={<><Navbar /><RequestHistory /></>} />
          <Route path="/accessories" element={<><Navbar /><Accessories /></>} />
          <Route path="/assetTransfer" element={<><Navbar /><AssetTransfer /></>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
