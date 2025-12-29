import api from './api';
import { ExchangeRate } from '@/types/rate';

export const ratesService = {
    async getCurrentRate(): Promise<ExchangeRate> {
        const response = await api.get<ExchangeRate>('/rates/current');
        return response.data;
    },

    async getRateHistory(limit: number = 10): Promise<ExchangeRate[]> {
        const response = await api.get<ExchangeRate[]>('/rates/history', {
            params: { limit },
        });
        return response.data;
    },

    async updateRate(saleRate: number): Promise<ExchangeRate> {
        // el backend ahora espera saleRate como nombre de campo
        const response = await api.post<ExchangeRate>('/rates', { saleRate });
        return response.data;
    },
};
