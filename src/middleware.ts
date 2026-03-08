import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Mapeamento de rotas para roles permitidas
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin': ['admin'],
  '/leader': ['admin', 'leader'],
  '/employee': ['admin', 'leader', 'employee'],
  '/dashboard': ['admin', 'leader', 'employee', 'recruiter'],
  '/recruitment': ['admin', 'leader', 'recruiter'],
}

function redirectWithCookies(request: NextRequest, response: NextResponse, to: string) {
  const url = new URL(to, request.url)
  const redirect = NextResponse.redirect(url)

  // Copia cookies que o Supabase pode ter atualizado
  response.cookies.getAll().forEach((c) => {
    redirect.cookies.set(c.name, c.value, c)
  })

  return redirect
}

// Válvula de Rede: Rate Limiting para o Portal de Carreiras (In-Memory Best Effort)
// Na Vercel Edge, este Map é compartilhado apenas na mesma instância/região.
const CAREERS_RATE_LIMIT = new Map<string, number[]>()
const LIMIT_PER_HOUR = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 hora

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = CAREERS_RATE_LIMIT.get(ip) || []

  // Limpa entradas antigas
  const validTimestamps = timestamps.filter(t => now - t < WINDOW_MS)

  if (validTimestamps.length >= LIMIT_PER_HOUR) {
    return false
  }

  validTimestamps.push(now)
  CAREERS_RATE_LIMIT.set(ip, validTimestamps)
  return true
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const method = request.method

  // 1. Camada de Proteção de Rede: Rate Limiting para Candidaturas (Portal de Carreiras)
  if (path.startsWith('/careers/') && path.endsWith('/apply') && method === 'POST') {
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1'

    if (!checkRateLimit(ip)) {
      console.warn(`[RateLimit] Bloqueado excesso de candidaturas para IP: ${ip}`)
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Limite de candidaturas excedido. Tente novamente em uma hora.'
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  // 2. Identificação de Tenant e Headers
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const requestHeaders = new Headers(request.headers);

  if (!isLocalhost && host) {
    requestHeaders.set('x-tenant-domain', host);
  } else if (isLocalhost) {
    const localTenant = request.headers.get('x-local-tenant');
    if (localTenant) {
      requestHeaders.set('x-tenant-domain', localTenant);
    }
  }

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // 3. Cliente Supabase e Sessão
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

          response = NextResponse.next({
            request: { headers: requestHeaders },
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. RBAC e Proteção de Rotas
  const protectedRoute = Object.keys(ROUTE_PERMISSIONS).find(route =>
    path.startsWith(route)
  )

  if (path === '/login' && user) {
    return redirectWithCookies(request, response, '/dashboard')
  }

  if (protectedRoute) {
    if (!user) {
      return redirectWithCookies(request, response, '/login')
    }

    const userRole = user.app_metadata?.role || user.user_metadata?.role

    if (userRole) {
      const allowedRoles = ROUTE_PERMISSIONS[protectedRoute]
      if (!allowedRoles.includes(userRole)) {
        console.warn(`Acesso negado: usuário ${user.id} com role '${userRole}' tentou acessar ${path}`)
        return redirectWithCookies(request, response, '/dashboard?error=access_denied')
      }
    } else {
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select(`
          status,
          role:roles ( name )
        `)
        .eq('id', user.id)
        .maybeSingle()

      if (roleError || !userData) {
        if (roleError) {
          console.error(`❌ [Middleware] Erro ao verificar permissões de ${user.id}:`, roleError.message)
        }
        return redirectWithCookies(request, response, '/login?error=auth_error')
      }

      if (userData.status !== 'active') {
        return redirectWithCookies(request, response, '/login?error=account_inactive')
      }

      const roleData = userData.role as { name: string } | { name: string }[] | null
      const roleName = Array.isArray(roleData)
        ? (roleData.length > 0 ? roleData[0].name : null)
        : (roleData?.name || null)

      const allowedRoles = ROUTE_PERMISSIONS[protectedRoute]

      if (!roleName || !allowedRoles.includes(roleName)) {
        return redirectWithCookies(request, response, '/dashboard?error=access_denied')
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
