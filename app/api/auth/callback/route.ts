import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

// Esta rota é usada para processar callbacks de autenticação do Supabase
// Por exemplo, quando um usuário clica em um link de redefinição de senha

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL para redirecionar após a autenticação
  return NextResponse.redirect(new URL("/dashboard", request.url))
}

