export type StockForecastSource = {
    item: string;
    category: 'Obat' | 'Alkes';
    currentStock: number;
    dailyUsage: number;
    volatility: number;
    threshold: number;
};

export type HospitalBorSource = {
    hospital: string;
    baseline: number;
    trend: number;
    variability: number;
    borThreshold: number;
};

export type StockForecastResult = StockForecastSource & {
    predictedNeed30d: number;
    confidenceLow: number;
    confidenceHigh: number;
    projectedBalance: number;
    alert: boolean;
    reasons: string[];
    recommendation: string;
};

export type BorForecastPoint = {
    week: string;
    prediction: number;
    confidenceLow: number;
    confidenceHigh: number;
};

export type BorForecastResult = HospitalBorSource & {
    series: BorForecastPoint[];
    reasons: string[];
    recommendation: string;
    exceedThreshold: boolean;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const toBorPoints = (hospital: HospitalBorSource): BorForecastPoint[] => {
    return Array.from({ length: 4 }, (_, index) => {
        const weekIndex = index + 1;
        const prediction = clampPercent(hospital.baseline + hospital.trend * weekIndex);
        const confidenceLow = clampPercent(prediction - hospital.variability);
        const confidenceHigh = clampPercent(prediction + hospital.variability);

        return {
            week: `Minggu +${weekIndex}`,
            prediction,
            confidenceLow,
            confidenceHigh,
        };
    });
};

export const stockRecommendation = (result: Omit<StockForecastResult, 'recommendation'>): string => {
    if (!result.alert) {
        return 'Stok aman. Pertahankan jadwal distribusi reguler dan lakukan review mingguan.';
    }

    if (result.projectedBalance < 0) {
        return 'Aktifkan pengadaan darurat 7 hari, redistribusi antar gudang, dan prioritas penggunaan untuk kasus kritis.';
    }

    return 'Jadwalkan pengadaan tambahan dalam 14 hari dan aktifkan buffer stock di rumah sakit dengan tren pemakaian tertinggi.';
};

export const borRecommendation = (exceedThreshold: boolean): string => {
    if (!exceedThreshold) {
        return 'BOR masih terkendali. Lanjutkan penjadwalan bed management dan discharge planning standar.';
    }

    return 'Aktifkan rencana surge capacity: tambah bed sementara, optimalkan discharge planning, dan buka kanal rujukan terkoordinasi.';
};

export const generateStockForecast = (source: StockForecastSource[]): StockForecastResult[] => {
    return source.map((row) => {
        const predictedNeed30d = Math.round(row.dailyUsage * 30);
        const confidenceDelta = Math.round(predictedNeed30d * row.volatility);
        const confidenceLow = Math.max(0, predictedNeed30d - confidenceDelta);
        const confidenceHigh = predictedNeed30d + confidenceDelta;
        const projectedBalance = row.currentStock - predictedNeed30d;
        const alert = projectedBalance <= row.threshold;
        const reasons = [
            `Konsumsi rata-rata ${row.dailyUsage} unit/hari dengan horizon 30 hari.`,
            `Variabilitas historis ±${Math.round(row.volatility * 100)}% membentuk confidence band.`,
            `Proyeksi saldo akhir ${projectedBalance} unit (threshold ${row.threshold} unit).`,
        ];

        const result = {
            ...row,
            predictedNeed30d,
            confidenceLow,
            confidenceHigh,
            projectedBalance,
            alert,
            reasons,
        };

        return {
            ...result,
            recommendation: stockRecommendation(result),
        };
    });
};

export const generateBorForecast = (source: HospitalBorSource[]): BorForecastResult[] => {
    return source.map((row) => {
        const series = toBorPoints(row);
        const maxProjected = Math.max(...series.map((point) => point.prediction));
        const exceedThreshold = maxProjected >= row.borThreshold;
        const reasons = [
            `Baseline BOR saat ini ${row.baseline}%.`,
            `Tren kenaikan ${row.trend.toFixed(1)}% per minggu pada 4 minggu mendatang.`,
            `Confidence band ±${row.variability.toFixed(1)}% terhadap prediksi utama.`,
        ];

        return {
            ...row,
            series,
            exceedThreshold,
            reasons,
            recommendation: borRecommendation(exceedThreshold),
        };
    });
};
