import React, { useState, useEffect } from 'react';

const PDFGenerator = ({request , buttonName}) =>{

    const generatePdf = async () => {
        try {
            const response = await fetch('http://172.16.250.247:5000/api/ClearanceCertificate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: '17.10.2024',           
                    name: request.Name,            
                    cpf: request.CPF,              
                    designation: request.Designation, 
                    division: request.Division      
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob(); 
            const url = window.URL.createObjectURL(blob); 

            const a = document.createElement('a'); 
            a.href = url; 
            a.download = 'ClearanceCertificate.pdf'; 
            document.body.appendChild(a); 
            a.click(); 
            a.remove(); 
            window.URL.revokeObjectURL(url); 
            console.log('downloaded')
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return(<div>
        <button onClick={generatePdf} className="pdf-generate-button">{buttonName}</button>
    </div>);
}

export default PDFGenerator;