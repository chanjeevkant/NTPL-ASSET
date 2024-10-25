import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './App.js';

const AssetTransfer = () => {
  const {client} = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [designation, setDesignation] = useState('');
  const [division, setDivision] = useState('');
  const [assetDetails, setAssetDetails] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState({}); // Change to an object
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    const response = await fetch(`http://172.16.250.247:5000/api/freeAssetList`);
    const data = await response.json();
    setAssetDetails(data);
  };

  const handleSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);

    if (selectedOptions.length > 0) {
      const pcId = selectedOptions[0].value.trim(); // Assume only one selection
      const assetDetail = assetDetails.find(asset => asset["PC ID"].trim() === pcId); // Find the selected asset
      console.log(assetDetail);
      if (assetDetail) {
        // Create the asset object directly
        setSelectedAsset({
          "PC ID": assetDetail["PC ID"],
          "CPU": assetDetail["CPU BRAND DETAILS"] || 'Nil',
          "Monitor": assetDetail["MONITOR SIZE"] || 'Nil',
          "Printer": assetDetail["PRINTER MODEL"] || 'Nil',
          "Processor": assetDetail["PROCESSOR TYPE"] || 'Nil',
          "UPS": assetDetail["UPS"] || 'Nil',
        });
      }
    } else {
      setSelectedAsset({}); // Clear selection if nothing is selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    const transferData = {
      name: name,
      cpf: cpf,
      designation: designation,
      division: division,
      assets: selectedAsset, // Send the selected asset object
    };
     console.log(selectedAsset);
    const response = await fetch('http://172.16.250.247:5000/api/assetTransfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferData),
    });

    if (response.ok) {
      setSuccessMessage('Transfer Request Submitted Successfully');
    } else {
      setSuccessMessage('Transfer Request Submission Failed');
    }

    setTimeout(() => {
      setSuccessMessage('');
      navigate(`/assetTransfer`);
    }, 2000);
  };

  if (client !== 2) {
    return (
      <div className="alert alert-danger mt-5" role="alert">
        You are not allowed to access this site. Only administrators can access this page.
      </div>
    );
  }

  return (
    <div className="asset-transfer-container mt-5">
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      <h2 className="text-center mb-4">Asset Transfer Form</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
        <div className="form-group">
          <label>Transfer To (CPF):</label>
          <input
            type="number"
            className="form-control"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Designation:</label>
          <input
            type="text"
            className="form-control"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Division:</label>
          <input
            type="text"
            className="form-control"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Free Assets:</label>
          <label>(press 'ctrl' to select an asset)</label>
          <select
            multiple
            className="form-control"
            onChange={handleSelectChange}
            style={{ height: '150px' }}
          >
            {assetDetails.map(asset => (
              <option key={asset["PC ID"]} value={asset["PC ID"]}>
                {`PC ID: ${asset["PC ID"]}, CPU: ${asset["CPU BRAND DETAILS"] || 'N/A'}, Monitor: ${asset["MONITOR SIZE"] || 'N/A'}`}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default AssetTransfer;
