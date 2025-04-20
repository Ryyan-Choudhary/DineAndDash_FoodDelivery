import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [schema, setSchema] = useState([]);
  const [error, setError] = useState(null);

  // Fetch schema from the backend API
  useEffect(() => {
    fetch('http://localhost:1443/api/schema')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => setSchema(data))
        .catch((error) => {
          console.error('Error fetching schema:', error);
          setError('Error fetching schema');
        });
  }, []);

  return (
      <div className="App">
        <h1>Dine and Dash - Database Schema</h1>

        {error && <div className="error">{error}</div>}

        <table>
          <thead>
          <tr>
            <th>Table Name</th>
            <th>Column Name</th>
          </tr>
          </thead>
          <tbody>
          {schema.length > 0 ? (
              schema.map((row, index) => (
                  <tr key={index}>
                    <td>{row.TableName}</td>
                    <td>{row.ColumnName}</td>
                  </tr>
              ))
          ) : (
              <tr>
                <td colSpan="2">No data available</td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
  );
}

export default App;
