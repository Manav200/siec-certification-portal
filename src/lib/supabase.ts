import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    !supabaseUrl.includes("your-project")
);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);

/**
 * Uploads a certificate background template to Supabase Storage (100% Free 1GB bucket)
 * Returns the permanent public HTTPS URL of the template
 */
export async function uploadCertificateImage(
  file: File,
  eventId: string
): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  const fileExt = file.name.split(".").pop() || "png";
  const fileName = `template-${eventId}-${Date.now()}.${fileExt}`;
  const filePath = `templates/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("certificates")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Supabase storage upload error:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("certificates")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
