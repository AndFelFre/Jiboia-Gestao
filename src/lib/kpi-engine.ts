import { z } from 'zod';

export const CalculatorPayloadSchema = z.object({
    target: z.number().min(0),
    actual: z.number().min(0),
    weight: z.number().min(0).default(1),
    capPercentage: z.number().min(50).default(150),
    isReversed: z.boolean().default(false),
});

export type CalculatorPayload = z.infer<typeof CalculatorPayloadSchema>;

export interface WeightedKpiInput {
    id: string;
    weight: number;
    achievement: number;
}

/**
 * Motor Matemático Principal dos KPIs
 * Calcula o atingimento mantendo os limites e respeitando KPIs invertidos (onde MENOR é MELHOR, ex: Churn)
 */
export function calculateKpiAchievement(params: CalculatorPayload) {
    const { target, actual, isReversed, capPercentage } = params;

    // Evita divisão por zero bizarra
    if (target === 0) return { achievement: 0, rawRatio: 0 };

    let ratio = 0;
    if (isReversed) {
        // Para KPIs como Churn: se meta era 5% e fiz o dobro (10%), meu atingimento é 50%. Se fiz 2.5%, meu atingimento é 200%.
        ratio = target / (actual === 0 ? 0.0001 : actual);
    } else {
        // Normal: se meta era 20 e fiz 10, atingimento é 50%.
        ratio = actual / target;
    }

    const percentage = ratio * 100;

    // Aplica o CAP (teto máximo) para não virar bagunça financeira
    const finalPercentage = Math.min(percentage, capPercentage);

    return { achievement: finalPercentage, rawRatio: ratio };
}

/**
 * Lista simplificada de feriados nacionais brasileiros (fixos).
 */
const BR_HOLIDAYS = [
    '01-01', // Ano Novo
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalho
    '09-07', // Independência
    '10-12', // Padroeira
    '11-02', // Finados
    '11-15', // Proclamação
    '11-20', // Consciência Negra
    '12-25', // Natal
];

/**
 * Normaliza a data para o fuso brasileiro (UTC-3) para evitar distorções de servidor (Vercel/UTC).
 */
export function getBrazilDate(date = new Date()): Date {
    const brOffset = -3;
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * brOffset));
}

/**
 * Calcula o número de dias úteis em um intervalo de datas.
 * (Segunda a Sexta, descontando feriados nacionais)
 */
export function getBusinessDays(start: Date, end: Date): number {
    let count = 0;
    const curDate = new Date(start.getTime());
    while (curDate <= end) {
        const dayOfWeek = curDate.getDay();
        const mmdd = `${String(curDate.getMonth() + 1).padStart(2, '0')}-${String(curDate.getDate()).padStart(2, '0')}`;

        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = BR_HOLIDAYS.includes(mmdd);

        if (!isWeekend && !isHoliday) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}

/**
 * Utilitário para Forecast: Dias Úteis Totais vs Decorridos do mês atual.
 */
export function getMonthBusinessDaysInfo() {
    const now = getBrazilDate();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const total = getBusinessDays(startOfMonth, endOfMonth);
    const elapsed = getBusinessDays(startOfMonth, now);

    return {
        total: Math.max(1, total),
        elapsed: Math.max(1, elapsed)
    };
}

/**
 * Normaliza e calcula o Score de Performance (0 a 1)
 * Fórmula: (RUA_Normalizado * 0.4) + (SMART_Progresso * 0.6)
 */
export function calculatePerformanceScore(ruaMean: number, smartProgress: number, hasSmart: boolean): number {
    // Normalizar RUA (1-5) para (0-1)
    // 1 -> 0, 5 -> 1 => (val - 1) / 4
    const normalizedRua = Math.max(0, Math.min(1, (ruaMean - 1) / 4));

    // SMART já vem em 0-1. Aplicamos o CAP de 150% (1.5)
    const cappedSmart = Math.min(smartProgress, 1.5);

    if (!hasSmart) return normalizedRua;

    return (normalizedRua * 0.4) + (cappedSmart * 0.6);
}

/**
 * Converte o Score de Performance em Bucket 1-3
 * 1: < 0.6 | 2: 0.6-0.9 | 3: > 0.9
 */
export function calculatePerformanceBucket(score: number): number {
    if (score < 0.6) return 1;
    if (score > 0.9) return 3;
    return 2;
}

/**
 * Função utilitária do Farol (Semântico para uso em Server/Client)
 */
export function getTrafficLight(achievement: number, thresholds = { green: 100, yellow: 80 }) {
    if (achievement >= thresholds.green) return 'green';
    if (achievement >= thresholds.yellow) return 'yellow';
    return 'red';
}
/**
 * Calcula a média ponderada de uma lista de KPIs.
 * Utilizado para consolidar o atingimento global de um vendedor ou equipe.
 */
export function calculateWeightedAverage(kpis: WeightedKpiInput[]): number {
    const totalWeight = kpis.reduce((acc, kpi) => acc + kpi.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = kpis.reduce((acc, kpi) => acc + (kpi.achievement * kpi.weight), 0);
    return weightedSum / totalWeight;
}
