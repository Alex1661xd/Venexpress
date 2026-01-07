import api from './api';
import { ExchangeRate, RateType } from '@/types/rate';

export const ratesService = {
    async getCurrentRate(): Promise<ExchangeRate> {
        const response = await api.get<ExchangeRate>('/rates/current');
        return response.data;
    },

    async getAllCurrentRates(): Promise<Record<RateType, ExchangeRate | null>> {
        const response = await api.get<Record<RateType, ExchangeRate | null>>('/rates/all-current');
        return response.data;
    },

    async getRateHistory(limit: number = 30): Promise<ExchangeRate[]> {
        const response = await api.get<ExchangeRate[]>('/rates/history', {
            params: { limit },
        });
        return response.data;
    },

    async updateRate(rateType: RateType, saleRate: number): Promise<ExchangeRate> {
        const response = await api.post<ExchangeRate>('/rates', { rateType, saleRate });
        return response.data;
    },
};
