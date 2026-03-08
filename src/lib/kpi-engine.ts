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
 * Calcula a média ponderada de uma lista de KPIs de forma segura.
 * Utiliza Number.EPSILON para mitigar imprecisões de ponto flutuante do V8.
 */
export function calculateWeightedAverage(kpis: WeightedKpiInput[]): number {
    if (!kpis || kpis.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    kpis.forEach((kpi) => {
        const weight = Math.max(0, kpi.weight);
        totalScore += (kpi.achievement * weight);
        totalWeight += weight;
    });

    if (totalWeight === 0) return 0;

    const result = totalScore / totalWeight;

    // Arredondamento seguro para 2 casas decimais (Padrão Corporativo)
    return Math.round((result + Number.EPSILON) * 100) / 100;
}

/**
 * Função utilitária do Farol (Semântico para uso em Server/Client)
 */
export function getTrafficLight(achievement: number, thresholds = { green: 100, yellow: 80 }) {
    if (achievement >= thresholds.green) return 'green';
    if (achievement >= thresholds.yellow) return 'yellow';
    return 'red';
}
