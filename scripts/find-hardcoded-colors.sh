#!/bin/bash

echo "=== CORES HARDCODADAS ENCONTRADAS ==="
echo ""

echo "1. Backgrounds problemáticos:"
grep -rn "bg-gray-50\|bg-white\|bg-gray-100" src/app --include="*.tsx" | head -20

echo ""
echo "2. Textos problemáticos:"
grep -rn "text-gray-900\|text-gray-600\|text-gray-500" src/app --include="*.tsx" | head -20

echo ""
echo "3. Bordas problemáticas:"
grep -rn "border-gray-200\|border-gray-300" src/app --include="*.tsx" | head -10

echo ""
echo "4. Botões/Links problemáticos:"
grep -rn "text-blue-600\|text-blue-800\|bg-blue-600" src/app --include="*.tsx" | head -10

echo ""
echo "=== SUBSTITUIÇÕES RECOMENDADAS ==="
echo "bg-gray-50 → bg-background"
echo "bg-white → bg-card"
echo "text-gray-900 → text-foreground"
echo "text-gray-600 → text-muted-foreground"
echo "text-gray-500 → text-muted-foreground"
echo "text-blue-600 → text-primary"
echo "bg-blue-600 → bg-primary"
echo "border-gray-200 → border-border"
echo "border-gray-300 → border-input"
echo "shadow → shadow-sm (ou remover)"
