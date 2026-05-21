import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata ?? {};
        const oauthName =
          (meta.full_name as string | undefined) ??
          (meta.name as string | undefined) ??
          (meta.nome_completo as string | undefined) ??
          null;
        const oauthAvatar =
          (meta.avatar_url as string | undefined) ??
          (meta.picture as string | undefined) ??
          null;

        if (oauthName || oauthAvatar) {
          const { data: profile } = await supabase
            .from("perfis_usuarios")
            .select("nome_completo, avatar_url")
            .eq("id", user.id)
            .single();

          const patch: Record<string, unknown> = {};
          if (oauthName && !profile?.nome_completo) patch.nome_completo = oauthName;
          if (oauthAvatar && !profile?.avatar_url) patch.avatar_url = oauthAvatar;

          if (Object.keys(patch).length > 0) {
            patch.updated_at = new Date().toISOString();
            await supabase.from("perfis_usuarios").update(patch).eq("id", user.id);
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_error`);
}
