"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateAvatar } from "@/lib/actions/profile";
import { getInitials } from "@/lib/utils";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface Props {
  name: string;
  avatarUrl: string | null;
  onUpdate?: (url: string) => void;
}

export function AvatarUpload({ name, avatarUrl, onUpdate }: Props) {
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");

    if (!ALLOWED.includes(file.type)) {
      setError("Use uma imagem JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("A imagem deve ter no máximo 2 MB.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the browser shows the new image even if path is the same
    const bustedUrl = `${publicUrl}?t=${Date.now()}`;

    const result = await updateAvatar(publicUrl);
    if (result?.error) {
      setError(result.error);
    } else {
      setPreview(bustedUrl);
      onUpdate?.(bustedUrl);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative group">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="relative w-16 h-16 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
          aria-label="Alterar foto de perfil"
        >
          {preview ? (
            <Image
              src={preview}
              alt="Foto de perfil"
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {getInitials(name || "?")}
              </span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{name || "—"}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="text-xs text-rose-500 hover:text-rose-600 font-medium mt-1 transition-colors disabled:opacity-50"
        >
          {loading ? "Enviando…" : "Alterar foto"}
        </button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        <p className="text-xs text-neutral-400 mt-0.5">JPG, PNG ou WebP · Máx. 2 MB</p>
      </div>
    </div>
  );
}
