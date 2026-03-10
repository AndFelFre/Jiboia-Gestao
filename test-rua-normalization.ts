import { normalizeRuaScore } from './src/lib/kpi-engine'

const testCases = [
    { name: 'Mínimo Absoluto', scores: [1, 1, 1], expected: 0 },
    { name: 'Máximo Absoluto', scores: [4, 4, 4, 4], expected: 1 },
    { name: 'Média Exata (2.5)', scores: [1, 4], expected: 0.5 },
    { name: 'Com Notas Nulas (Cenário Real)', scores: [3, 4, null, null], expected: 0.8333 }, // Média 3.5 -> (3.5-1)/3 = 0.8333
    { name: 'Apenas uma nota', scores: [2, null, null], expected: 0.3333 }, // Média 2 -> (2-1)/3 = 0.3333
    { name: 'Sem notas', scores: [null, null], expected: 0 }
]

console.table(testCases.map(tc => {
    const result = normalizeRuaScore(tc.scores)
    return {
        Cenário: tc.name,
        Input: JSON.stringify(tc.scores),
        Esperado: tc.expected,
        Resultado: result.toFixed(4),
        Passou: Math.abs(result - tc.expected) < 0.001 ? '✅' : '❌'
    }
}))
