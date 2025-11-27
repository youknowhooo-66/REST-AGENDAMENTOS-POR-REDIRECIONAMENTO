import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';

const API_BASE_URL = 'http://localhost:3000'; // Assuming your backend runs on port 3000

const ServiceSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Assuming the search endpoint is protected and requires authentication
      // You would typically get the token from your AuthContext
      const token = localStorage.getItem('accessToken'); // Placeholder for token retrieval
      const response = await axios.get(`${API_BASE_URL}/services/search?name=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error searching services:', err);
      setError('Failed to search services. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-cyan-600 dark:text-cyan-400 mb-8">
          Buscar Serviços
        </h1>

        <form onSubmit={handleSearch} className="flex gap-4 mb-8 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Digite o nome do serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>

        {loading && <div className="text-center">Carregando resultados...</div>}
        {error && <div className="text-center text-red-500">Erro: {error}</div>}
        
        {!loading && !error && searchResults.length === 0 && searchTerm.trim() && (
          <div className="text-center text-gray-500">Nenhum serviço encontrado para "{searchTerm}".</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceSearchPage;
