# Guia de Substituição - Cores Hardcoded → Tokens Semânticos

## Comando para aplicar substituições em massa (USE COM CUIDADO!)

### 1. Backgrounds
```bash
# Substituições seguras
sed -i 's/bg-gray-50/bg-background/g' src/app/**/*.tsx
sed -i 's/bg-white/bg-card/g' src/app/**/*.tsx
sed -i 's/bg-gray-100/bg-muted/g' src/app/**/*.tsx
```

### 2. Textos
```bash
# Substituições seguras
sed -i 's/text-gray-900/text-foreground/g' src/app/**/*.tsx
sed -i 's/text-gray-700/text-foreground/g' src/app/**/*.tsx
sed -i 's/text-gray-600/text-muted-foreground/g' src/app/**/*.tsx
sed -i 's/text-gray-500/text-muted-foreground/g' src/app/**/*.tsx
```

### 3. Cores de Brand/Primary
```bash
sed -i 's/text-blue-600/text-primary/g' src/app/**/*.tsx
sed -i 's/text-blue-800/text-primary/g' src/app/**/*.tsx
sed -i 's/bg-blue-600/bg-primary/g' src/app/**/*.tsx
sed -i 's/bg-blue-100/bg-primary\/10/g' src/app/**/*.tsx
sed -i 's/text-blue-800/text-primary/g' src/app/**/*.tsx
```

### 4. Cores de Destructive/Error
```bash
sed -i 's/text-red-600/text-destructive/g' src/app/**/*.tsx
sed -i 's/bg-red-100/bg-destructive\/10/g' src/app/**/*.tsx
sed -i 's/text-red-800/text-destructive/g' src/app/**/*.tsx
```

### 5. Bordas
```bash
sed -i 's/border-gray-200/border-border/g' src/app/**/*.tsx
sed -i 's/border-gray-300/border-input/g' src/app/**/*.tsx
```

### 6. Outros status
```bash
# Green/Success
sed -i 's/bg-green-100/bg-green-500\/10/g' src/app/**/*.tsx
sed -i 's/text-green-800/text-green-600/g' src/app/**/*.tsx

# Yellow/Warning
sed -i 's/bg-yellow-100/bg-yellow-500\/10/g' src/app/**/*.tsx
sed -i 's/text-yellow-800/text-yellow-600/g' src/app/**/*.tsx

# Purple
sed -i 's/bg-purple-100/bg-purple-500\/10/g' src/app/**/*.tsx
sed -i 's/text-purple-800/text-purple-600/g' src/app/**/*.tsx

# Orange
sed -i 's/bg-orange-100/bg-orange-500\/10/g' src/app/**/*.tsx
sed -i 's/text-orange-800/text-orange-600/g' src/app/**/*.tsx
```

## Arquivos que precisam de atenção especial:

1. **Formulários** - Inputs com `border-gray-300` → `border-input`
2. **Tabelas** - Headers com `bg-gray-50` → `bg-muted/50`
3. **Botões** - Cores de hover e focus states
4. **Badges/Status** - Cores de status (active/inactive/pending)

## Verificação pós-substituição:

```bash
# Verifique se ainda há cores hardcoded
grep -r "bg-gray\|text-gray\|border-gray" src/app --include="*.tsx"

# Build para garantir que não quebrou
npm run build
```
