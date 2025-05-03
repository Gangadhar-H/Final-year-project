import { useState, useEffect } from 'react';
import api from '../services/api';

const useAxios = (url, method = 'GET', initialData = null) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    const refresh = () => setRefreshIndex(prev => prev + 1);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await api({
                    method,
                    url,
                });
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred');
                console.error('API Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, refreshIndex]);

    const sendRequest = async (requestConfig) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api(requestConfig);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            setLoading(false);
            throw err;
        }
    };

    return { data, loading, error, refresh, sendRequest };
};

export default useAxios;