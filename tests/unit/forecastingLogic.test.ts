import { describe, expect, it } from 'vitest';
import { generateBorForecast, generateStockForecast } from '../../utils/forecastingLogic';

describe('forecastingLogic', () => {
    it('menghitung prediksi stok 30 hari beserta alert threshold', () => {
        const result = generateStockForecast([
            { item: 'Item A', category: 'Obat', currentStock: 500, dailyUsage: 20, volatility: 0.1, threshold: 150 },
            { item: 'Item B', category: 'Alkes', currentStock: 300, dailyUsage: 15, volatility: 0.2, threshold: 80 },
        ]);

        expect(result[0].predictedNeed30d).toBe(600);
        expect(result[0].confidenceLow).toBe(540);
        expect(result[0].confidenceHigh).toBe(660);
        expect(result[0].alert).toBe(true);
        expect(result[0].recommendation).toContain('pengadaan darurat');

        expect(result[1].predictedNeed30d).toBe(450);
        expect(result[1].alert).toBe(true);
    });

    it('menghitung prediksi BOR mingguan dan flag exceed threshold', () => {
        const result = generateBorForecast([
            { hospital: 'RS A', baseline: 80, trend: 2, variability: 4, borThreshold: 85 },
            { hospital: 'RS B', baseline: 70, trend: 1, variability: 3, borThreshold: 85 },
        ]);

        expect(result[0].series).toHaveLength(4);
        expect(result[0].series[0].prediction).toBe(82);
        expect(result[0].series[3].prediction).toBe(88);
        expect(result[0].exceedThreshold).toBe(true);
        expect(result[0].recommendation).toContain('surge capacity');

        expect(result[1].exceedThreshold).toBe(false);
        expect(result[1].recommendation).toContain('terkendali');
    });
});
