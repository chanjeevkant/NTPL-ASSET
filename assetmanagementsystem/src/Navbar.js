import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './App.js';
import './Homepage.css';

const MainLayout = () => {
  const { client, cpf } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column">
      <nav className="navbar navbar-custom navbar-expand-lg navbar-light bg-light fixed-top">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center">
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
      <header className="mt-5 pt-5"> {/* Add padding-top to compensate for the fixed navbar */}
        <Outlet /> {/* This renders the child routes */}
      </header>
    </div>
  );
};

export default MainLayout;
