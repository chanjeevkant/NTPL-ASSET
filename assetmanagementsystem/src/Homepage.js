import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './App.js';
import './Homepage.css';

function Homepage() {
  const { client ,cpf,setCpf} = useAuth();
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState('');
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const clientCpf = cpf;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setData(null);
    setError('');

    try {
      const columnsResponse = await fetch('http://172.16.250.247:5000/api/columns');
      if (!columnsResponse.ok) throw new Error('Network response was not ok for columns');
      const columnsResult = await columnsResponse.json();
      setColumns(columnsResult);

      const dataResponse = await fetch(`http://172.16.250.247:5000/api/data?cpf=${encodeURIComponent(cpf)}`);
      if (!dataResponse.ok) throw new Error('Network response was not ok for data');
      const dataResult = await dataResponse.json();

      if (Object.keys(dataResult).length === 0) {
        setError('No records found');
        setData(null);
      } else {
        setData(dataResult);
        setError('');
      }
    } catch (err) {
      console.log(err);
      setError('Error fetching data');
    }
  };

  const handleChange = (e) => {
    setCpf(e.target.value);
  };

  const handleEdit = (column) => {
    setEditingRow(column);
    setEditData({ [column]: data[column] });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ [name]: value });
  };

  const handleSave = async (column) => {
    try {
      const updateComponents = {
        cpf: cpf,
        columnName: column,
        setValue: editData[column]
      };

      const response = await fetch('http://172.16.250.247:5000/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updateComponents })
      });

      if (!response.ok) throw new Error('Network response was not ok for update');

      const result = await response.json();
      setData(prevData => ({
        ...prevData,
        [column]: result.updatedValue || editData[column]
      }));
      setEditingRow(null);
      setEditData({});
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error saving data');
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  return (
    <div className="d-flex flex-column">
      
     
  <header>
        <form className='details-form mt-5' onSubmit={handleSubmit}>
          <label htmlFor="cpf">Enter your CPF number:</label>
          <input
            type="text"
            id="cpf"
            className="form-control"
            value={cpf}
            onChange={handleChange}
            placeholder="CPF Number"
            required
          />
          <button type="submit" className="btn btn-primary mt-2">Submit</button>
        </form>

        {error && <p className="text-danger">{error}</p>}

        {data && columns.length > 0 && (
          <div className="table-container mt-4">
            <h2>Data for CPF Number: {cpf}</h2>
            <table className="table table-bordered data-table">
              <tbody>
                {columns.map((column) => (
                  data[column.replace(/\s+$/, '')] && (
                    <tr key={column}>
                      <td className="column-name">{column.replace(/\s+$/, '')}</td>
                      <td className="column-data">
                        {editingRow === column ? (
                          <input
                            type="text"
                            name={column}
                            value={editData[column] || ''}
                            onChange={handleEditChange}
                            className="form-control"
                          />
                        ) : (
                          data[column.replace(/\s+$/, '')]
                        )}
                      </td>
                      <td style={{ display: client === 2 ? 'table-cell' : 'none' }}>
                        {client === 2 && (
                          editingRow === column ? (
                            <div className="edit-actions">
                              <button className="btn btn-success" onClick={() => handleSave(column)}>Save</button>
                              <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                            </div>
                          ) : (
                            <button className="btn btn-warning" onClick={() => handleEdit(column)}>
                              Edit
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </header>
    </div>
  );
}

export default Homepage;
