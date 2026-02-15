import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  const supabaseUserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization'),
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabaseUserClient.auth.getUser()

  if (!user || Object.keys(user).length ===0) {
    return new Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (error) {
    return new Response.json({ error: error.message }, { status: 400 })
  }

  return new Response.json({ success: true })
}

