import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

function base64UrlDecode(str) {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

function extrairUserIdDoToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = base64UrlDecode(parts[1]);
    return payload.sub || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const { acao, email, senha, restaurante_id, nome, user_id } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token não enviado' }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    const callerId = extrairUserIdDoToken(token);
    if (!callerId) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('perfis')
      .select('papel')
      .eq('id', callerId)
      .single();

    if (perfilError || perfil?.papel !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), {
        status: 403,
        headers: CORS_HEADERS,
      });
    }

    if (acao === 'criar_usuario') {
      if (!email || !senha || !restaurante_id) {
        return new Response(JSON.stringify({ error: 'Dados incompletos' }), {
          status: 400,
          headers: CORS_HEADERS,
        });
      }

      const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome },
      });

      if (createError || !authUser?.user) {
        return new Response(
          JSON.stringify({ error: createError?.message || 'Erro ao criar usuário' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const { error: insertError } = await supabaseAdmin.from('perfis').insert({
        id: authUser.user.id,
        email,
        restaurante_id,
        papel: 'lojista',
        nome,
      });

      if (insertError) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 400,
          headers: CORS_HEADERS,
        });
      }

      return new Response(
        JSON.stringify({ id: authUser.user.id, email }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    if (acao === 'excluir_usuario') {
      if (!user_id) {
        return new Response(JSON.stringify({ error: 'user_id obrigatório' }), {
          status: 400,
          headers: CORS_HEADERS,
        });
      }
      await supabaseAdmin.from('perfis').delete().eq('id', user_id);
      await supabaseAdmin.auth.admin.deleteUser(user_id);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS });
    }

    if (acao === 'excluir_loja') {
      if (!restaurante_id) {
        return new Response(JSON.stringify({ error: 'restaurante_id obrigatório' }), {
          status: 400,
          headers: CORS_HEADERS,
        });
      }
      await supabaseAdmin.from('produtos').delete().eq('restaurante_id', restaurante_id);
      await supabaseAdmin.from('pedidos').delete().eq('restaurante_id', restaurante_id);
      await supabaseAdmin.from('perfis').delete().eq('restaurante_id', restaurante_id);
      await supabaseAdmin.from('restaurantes').delete().eq('id', restaurante_id);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});
