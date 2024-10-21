import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './App.js'; 
import PDFGenerator from './PdfGenerator.js'

import './AssetSurrender.css';

const RequestHistory = () => {
  const location = useLocation();
  const {cpf, client } = useAuth();  

  const [Requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [trigger, setTrigger] = useState(false);
  console.log('print');

  const fetchRequestHistory = async () => {
    try {
      let response;
      if (client === 2) {
        response = await fetch(`http://172.16.250.247:5000/api/requestHistory`);
      } else {
        response = await fetch(`http://172.16.250.247:5000/api/requestHistory?cpf=${encodeURIComponent(cpf)}`);
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchRequestHistory(); 
  }, [trigger]); 

  const handleAccept = async (cpf, assets, index) => {
    const surrenderAsset = {
      cpf: cpf,
      assets: assets.split(' ')
    };                                                                                                                                                  
    
    try {
      const response = await fetch('http://172.16.250.247:5000/api/acceptSurrender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ surrenderAsset })
      });

      if (response.ok) {
        const updatedRequests = [...Requests];
        updatedRequests[index].Status = 'Accepted'; 
        setRequests(updatedRequests);
      } else {
        throw new Error('Failed to accept surrender');
      }
    } catch (error) {
      console.error(error);
    }
    finally{
      setTrigger(!trigger);
    }
  };

  const handleRevert = async(cpf,index) => {
    const revertAsset = {
      cpf: cpf,
    }
    try {
      const response = await fetch('http://172.16.250.247:5000/api/revertSurrender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ revertAsset })
      });

      if (response.ok) {
        const updatedRequests = [...Requests];
        updatedRequests[index].Status = 'Reverted'; 
        setRequests(updatedRequests);
      } else {
        throw new Error('Failed to revert surrender');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filter requests
  const inProcessRequests = Requests.filter(request => request.Status === 'In Process');
  const approvedRejectedRequests = Requests.filter(request => request.Status !== 'In Process');

  return (
    <div className="request-history-container mt-3">
      <h3 className="request-history-title">Surrender Requests:</h3>
      {loading ? (
        <p className="text-center">Loading...</p> 
      ) : error ? (
        <p className="text-danger text-center">Error: {error}</p> 
      ) : inProcessRequests.length > 0 ? (
        <table className="table table-striped asset-surrender-table mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>CPF</th>
              <th>Designation</th>
              <th>Assets</th>
              <th>Remarks</th>
              <th>Status</th>
              <th>Edit Status</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {inProcessRequests.map((request, index) => (
              <tr key={index}>
                <td>{request.Name}</td>
                <td>{request.CPF}</td>
                <td>{request.Designation}</td>
                <td>{request.Assets}</td>
                <td>{request.Remarks}</td>
                <td>{request.Status}</td>
                <td>
                    <PDFGenerator request={request} buttonName = {'Request Form'} /> 
                </td>
                <td>
                  <button 
                    className="btn btn-success btn-sm request-accept-button"
                    onClick={() => handleAccept(request.CPF, request.Assets, index)} 
                  >
                    Accept
                  </button>
                  <button 
                    className="btn btn-danger btn-sm ml-2 request-revert-button"
                    onClick={() => handleRevert(request.CPF,index)}
                  >
                    Revert
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-3 text-center request-no-data">
          <p>No requests available</p>
        </div>
      )}

      <h3 className="request-history-title">Approved/Rejected Requests:</h3>
      {approvedRejectedRequests.length > 0 ? (
        <table className="table table-striped asset-surrender-table mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>CPF</th>
              <th>Designation</th>
              <th>Assets</th>
              <th>Remarks</th>
              <th>Status</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {approvedRejectedRequests.map((request, index) => (
              <tr key={index}>
                <td>{request.Name}</td>
                <td>{request.CPF}</td>
                <td>{request.Designation}</td>
                <td>{request.Assets}</td>
                <td>{request.Remarks}</td>
                <td>{request.Status}</td>
                <td>
                  {request.Status == 'Accepted' ? (
                    <PDFGenerator request={request} buttonName = {'Clearance Certificate'} /> 
                  ):'Not Applicable'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-3 text-center request-no-data">
          <p>No approved or rejected requests available</p>
        </div>
      )}
    </div>
  );
};

export default RequestHistory;
