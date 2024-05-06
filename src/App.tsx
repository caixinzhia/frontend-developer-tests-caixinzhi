/*
 * @Description: 
 * @Autor: 24
 * @Date: 2024-05-06 10:21:51
 * @LastEditors: 24
 * @LastEditTime: 2024-05-06 11:24:01
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface User {
  gender: string;
  name: {
    first: string;
    last: string;
  };
  location: {
    city: string;
    state: string;
  };
  registered: {
    date: string;
  };
  picture: {
    thumbnail: string;
  };
  nat: string;
}

interface Country {
  nat: string;
  users: User[];
}

const App: React.FC = () => {
  const [countries, setCountries] = useState<{ [key: string]: User[] }>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>('all');

  useEffect(() => {
    axios.get('https://randomuser.me/api/?results=100#')
      .then(response => {
        const sortedUsers = response.data.results.sort((a: any, b: any) => {
          return new Date(a.registered.date).getTime() - new Date(b.registered.date).getTime();
        });

        const countriesMap: { [key: string]: User[] } = {};
        sortedUsers.forEach((user: User) => {
          if (!countriesMap[user.nat]) {
            countriesMap[user.nat] = [];
          }
          countriesMap[user.nat].push(user);
        });
        const countriesArray = Object.entries(countriesMap).map(([key, value]) => ({ nat: key, users: value }));
        countriesArray.sort((a, b) => b.users.length - a.users.length);
        setSelectedCountry(countriesArray[0]?.nat || null);

        const sortedCountriesMap: { [key: string]: User[] } = {};
        countriesArray.forEach(country => {
          sortedCountriesMap[country.nat] = country.users;
        });
        setCountries(sortedCountriesMap);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleCountryClick = (nat: string) => {
    setSelectedCountry(nat);
    setGenderFilter('all')
  };

  const handleGenderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGenderFilter(event.target.value);
  };

  const filteredUsers = selectedCountry ? countries[selectedCountry] : [];
  return (
    <div>
      <h1>Country Users</h1>

      <div className="flex">
        <span>Countries</span>
        <div>
          {Object.keys(countries).map(nat => (
            <button key={nat} style={{ display: 'inline-block', margin: '0 8px', color: selectedCountry === nat ? 'blue': 'black' }} onClick={() => handleCountryClick(nat)}>
              {nat}
            </button>
          ))}
        </div>
      </div>
      <div>
        <select value={genderFilter} onChange={handleGenderChange}>
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div className="flex">
        <span>Users</span>
        <div>
          {selectedCountry && (
            <div>
              <h2>{selectedCountry} Users</h2>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th >avatar</th>
                    <th >Name</th>
                    <th>Gender</th>
                    <th >City</th>
                    <th>State</th>
                    <th >Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredUsers || [])
                    .sort((a: any, b: any) => {
                      return new Date(b.registered.date).getTime() - new Date(a.registered.date).getTime();
                    })
                    .filter(user => genderFilter === 'all' || user.gender === genderFilter)
                    .map(user => (
                      <tr key={user.name.first + user.name.last} style={{ borderBottom: '1px solid #ddd' }}>
                         <td ><img style={{ borderRadius: '50%'}} src={user.picture.thumbnail} alt={`${user.name.first} ${user.name.last}`} /></td>
                        <td >{`${user.name.first} ${user.name.last}`}</td>
                        <td >{user.gender}</td>
                        <td>{user.location.city}</td>
                        <td >{user.location.state}</td>
                        <td >{new Date(user.registered.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;