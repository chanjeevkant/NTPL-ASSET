import React, { useEffect, useState } from 'react';
import './AssetList.css';

function AssetList() {
  const [data, setData] = useState([]);
  const [prevData, setPrevData] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://172.16.250.247:5000/api/assets');
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();

        if (Array.isArray(result)) {
          setData(result);
          setPrevData(result); 
        } else if (typeof result === 'object' && result !== null) {
          setData([result]);
          setPrevData([result]);
        } else {
          setError('Unexpected data format');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching data');
      }
    };

    fetchData();
  }, []);

  const handleFilter = (event) => {
    const filterTerm = event.target.value.toLowerCase();
    if (filterTerm === '') {
      setData(prevData);
    } else {
      const filteredData = data.filter((item) =>
        Object.values(item).some(value =>
          value !== null && value.toString().toLowerCase().includes(filterTerm)
        )
      );
      setData(filteredData);
    }
    setCurrentPage(1);
  };

  // Pagination Logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getVisiblePages = () => {
    const visiblePages = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, startPage + 3);

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  };

  return (
    <div className="container asse ">
      
      
      <div className="asset-table-container bg-white rounded shadow p-4">
      <h1 className="table-title text-center text-dark mb-4">Asset Details</h1>
        <input
          onChange={handleFilter}
          className="form-control filter-input mb-3"
          placeholder="Filter"
        />
        {error && <p className="text-danger text-center">{error}</p>}
        <table className="table asset-table">
          <thead>
            <tr>
              {data.length > 0 && Object.keys(data[0]).map((key) => (
                <th key={key} className="bg-primary text-white">{key.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value, i) => (
                    <td key={i}>{value !== null ? value : 'N/A'}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="100%" className="text-center">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination justify-content-center mt-3">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-primary mx-1"
        >
          Previous
        </button>
        {getVisiblePages().map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`btn btn-primary mx-1 ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-primary mx-1"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AssetList;
