// Teste simples de conexão com Supabase
// Execute este código no console do navegador (F12 > Console)

async function testSupabaseConnection() {
  console.log('🧪 Testando conexão com Supabase...\n')
  
  // Verificar variáveis de ambiente
  console.log('1. Variáveis de ambiente:')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NÃO DEFINIDA')
  console.log('   KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida (tamanho: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : '❌ NÃO DEFINIDA')
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('\n❌ ERRO: Variáveis de ambiente não estão configuradas!')
    console.log('\n💡 Solução:')
    console.log('   1. Pare o servidor (Ctrl+C)')
    console.log('   2. Verifique se .env.local existe na raiz do projeto')
    console.log('   3. Confirme que contém NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('   4. Reinicie: npm run dev')
    return
  }
  
  // Testar conexão
  console.log('\n2. Testando conexão...')
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Conexão OK!')
      console.log('   📊 Configurações:', data)
    } else {
      console.error('   ❌ Erro na conexão:', response.status, response.statusText)
      const errorText = await response.text()
      console.log('   Detalhes:', errorText)
    }
  } catch (error) {
    console.error('   ❌ Erro na requisição:', error)
  }
}

// Executar teste
testSupabaseConnection()
