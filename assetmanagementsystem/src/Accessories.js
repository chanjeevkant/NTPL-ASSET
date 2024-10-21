import React, { useState, useEffect } from 'react';
import { useAuth } from './App.js';

const Accessories = () => {
    const { cpf,client } = useAuth(); 
    const [accessories, setAccessories] = useState([]);
    console.log(cpf);

    const fetchAccessories = async () => {
        try {
            const response = await fetch('http://172.16.250.247:5000/api/accessories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cpf: cpf })
            });

            if (response.ok) {
                const data = await response.json();
                setAccessories(data);
            } else {
                setAccessories([]);
            }
        } catch (error) {
            console.error(error);
            setAccessories([]);
        }
    };

    useEffect(() => {
        fetchAccessories(); 
    }, [cpf]);

    const renderCell = (value) => (value ? value : 'N/A'); 

    return (
        <div>
        <h1>Accessories Details</h1>
        {client == 1 ? (
            accessories.length > 0 ? (
                <table className="table table-striped asset-surrender-table mt-3">
                    <thead>
                        <tr>
                            <th>PC ID</th>
                            <th>Monitor Size</th>
                            <th>Other Installed Software Details</th>
                            <th>Wireless Modem</th>
                            <th>UPS</th>
                            <th>V/C Speaker</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accessories.map((item, index) => (
                            <tr key={index}>
                                <td>{renderCell(item['PC ID'])}</td>
                                <td>{renderCell(item['MONITOR SIZE'])}</td>
                                <td>{renderCell(item['OTHER INSTALLED SOFTWARE DETAILS'])}</td>
                                <td>{renderCell(item['WIRELESS MODEM'])}</td>
                                <td>{renderCell(item['UPS'])}</td>
                                <td>{renderCell(item['V/C SPEAKER'])}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No accessories found.</p>
            )
        ) : (
            <p>Login as User</p>
        )}
    </div>
    );
};

export default Accessories;
