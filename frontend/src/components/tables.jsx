import React, { useState, useEffect } from 'react';
import './tables.css'; // Add this line to import styles

function Tables() {
    const [tables, setTables] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/tables')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => setTables(data))
            .catch((error) => {
                console.error('Error fetching table names:', error);
                setError('Error fetching table names');
            });
    }, []);

    return (
        <div className="tables-page">
            <h1 className="header">📋 Database Tables</h1>
            {error && <div className="error">{error}</div>}
            <table className="tables-list">
                <thead>
                <tr>
                    <th>Table Name</th>
                </tr>
                </thead>
                <tbody>
                {tables.length > 0 ? (
                    tables.map((table, index) => (
                        <tr key={index}>
                            <td>{table.TableName}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="1">No tables found</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default Tables;
