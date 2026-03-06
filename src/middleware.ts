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

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  // Ajusta request headers para suportar identificação de tenant downstream
  const requestHeaders = new Headers(request.headers);

  if (!isLocalhost && host) {
    requestHeaders.set('x-tenant-domain', host);
  } else if (isLocalhost) {
    // Para facilitar testes locais: se enviar no header 'x-local-tenant', o middleware acata
    const localTenant = request.headers.get('x-local-tenant');
    if (localTenant) {
      requestHeaders.set('x-tenant-domain', localTenant);
    }
  }

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })

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

  const path = request.nextUrl.pathname

  // Verifica se é uma rota protegida
  const protectedRoute = Object.keys(ROUTE_PERMISSIONS).find(route =>
    path.startsWith(route)
  )

  // Redireciona usuário logado fora do login
  if (path === '/login' && user) {
    return redirectWithCookies(request, response, '/dashboard')
  }

  // Protege rotas que requerem autenticação
  if (protectedRoute) {
    if (!user) {
      return redirectWithCookies(request, response, '/login')
    }

    // RBAC: Verifica permissão de role
    // Tenta obter do JWT primeiro (mais rápido, sem query no banco)
    const userRole = user.app_metadata?.role || user.user_metadata?.role

    if (userRole) {
      // Role está no JWT, verifica permissão
      const allowedRoles = ROUTE_PERMISSIONS[protectedRoute]
      if (!allowedRoles.includes(userRole)) {
        console.warn(`Acesso negado: usuário ${user.id} com role '${userRole}' tentou acessar ${path}`)
        return redirectWithCookies(request, response, '/dashboard?error=access_denied')
      }
    } else {
      // Role não está no JWT, verifica no banco
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
        } else {
          console.warn(`⚠️ [Middleware] Usuário ${user.id} não possui perfil sincronizado no banco (public.users). Redirecionando...`)
        }
        return redirectWithCookies(request, response, '/login?error=auth_error')
      }

      // Verifica status
      if (userData.status !== 'active') {
        return redirectWithCookies(request, response, '/login?error=account_inactive')
      }

      // Verifica role
      const roleData = userData.role as { name: string } | { name: string }[] | null
      const roleName = Array.isArray(roleData)
        ? (roleData.length > 0 ? roleData[0].name : null)
        : (roleData?.name || null)

      const allowedRoles = ROUTE_PERMISSIONS[protectedRoute]

      if (!roleName || !allowedRoles.includes(roleName)) {
        console.warn(`[Middleware] Acesso ${roleName ? 'bloqueado' : 'negado (role null)'}: usuário ${user.id} role='${roleName}' path='${path}'`)
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
