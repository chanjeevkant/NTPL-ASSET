import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AssetSurrender.css'; // Import your custom CSS

const AssetSurrender = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [designation, setDesignation] = useState('');
  const [assetDetails, setAssetDetails] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [surrenderRemarks, setSurrenderRemarks] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [empdetails,setEmpDetails] = useState({});

  useEffect(() => {
    if (cpf) {
      fetchPendingRequests();
    }
    else{
        setName('');
    setCpf('');
    setDesignation('');
    setSelectedAssets([]);
    setSurrenderRemarks('');
    setSuccessMessage('');
    setPendingRequests([]);
    }
  }, [cpf]);

  const fetchEmpDetails = async(cpf)=>{
    const response = await fetch(`http://172.16.250.247:5000/api/data?cpf=${encodeURIComponent(cpf)}`);
    const data = await response.json();
    setEmpDetails(data);
    setName(data.NAME);
  };

  const fetchPendingRequests = async () => {
    const response = await fetch(`http://172.16.250.247:5000/api/pendingRequests?cpf=${cpf}`);
    const data = await response.json();
    setPendingRequests(data);
  };

  const fetchAssets = async (cpf) => {
    if (!cpf) return;
    const response = await fetch(`http://172.16.250.247:5000/api/assetDropdown?cpf=${cpf}`);
    const data = await response.json();
    setAssetDetails(data);
  };

  const handleCpfChange = (e) => {
    const cpfValue = e.target.value;
    setCpf(cpfValue);
    if (cpfValue.length >= 5) {
      fetchAssets(cpfValue);
      fetchEmpDetails(cpfValue);
    }
    else setAssetDetails([]);
  };

  const handleSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedAssets(selectedOptions);
  };

  const handleSubmit = async (e) => {
    const surrenderEntries = {
      name: name,
      cpf: cpf,
      designation: designation,
      assets: selectedAssets,
      surrenderRemarks: surrenderRemarks
    };

    const response = await fetch('http://172.16.250.247:5000/api/assetSurrender', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ surrenderEntries })
    });

    if(response.ok){
        setSuccessMessage('Request Submitted Successfully');
        
    }
    else{
        setSuccessMessage('Request Submission Failed');
    }
    setTimeout(() => {
        setSuccessMessage('');
        navigate(`/assetSurrender`);
      }, 2000); 
      
  };

  return (
    <div className="asset-surrender-container mt-5">
         {successMessage && (
  <div className="custom-alert" role="alert">
    {successMessage}
  </div>
)}
      <h2 className="asset-surrender-title text-center mb-4">Asset Surrender Form</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
        <div className="form-group asset-surrender-form-group">
          <label>Name:</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group asset-surrender-form-group">
          <label>CPF:</label>
          <input
            type="number"
            className="form-control"
            value={cpf}
            onChange={handleCpfChange}
            required
          />
        </div>
        <div className="form-group asset-surrender-form-group">
          <label>Designation:</label>
          <input
            type="text"
            className="form-control"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
          />
        </div>
        <div className="form-group asset-surrender-form-group">
          <label>Asset Details:</label><label>(press 'ctrl' to select multiple assets)</label>
          <select
            multiple
            className="form-control"
            value={selectedAssets}
            onChange={handleSelectChange}
            style={{ height: '150px' }} // Adjust height for better visibility
          >
            {assetDetails && assetDetails.map(asset => (
              <option key={asset["PC ID"]} value={asset["PC ID"]}>
                {asset["PC ID"]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group asset-surrender-form-group">
          <label>Surrender Remarks:</label>
          <textarea
            className="form-control"
            value={surrenderRemarks}
            onChange={(e) => setSurrenderRemarks(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary asset-surrender-btn-block">Submit</button>
      </form>

      <div>
        <h3 className="mt-5">Pending Requests:</h3>
        {pendingRequests.length > 0 ? (
          <table className="table table-striped asset-surrender-table mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>CPF</th>
                <th>Designation</th>
                <th>Assets</th>
                <th>Remarks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request, index) => (
                <tr key={index}>
                  <td>{request.Name}</td>
                  <td>{request.CPF}</td>
                  <td>{request.Designation}</td>
                  <td>{request.Assets}</td>
                  <td>{request.Remarks}</td>
                  <td>{request.Status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="mt-3">
            <p>No pending requests available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetSurrender;
