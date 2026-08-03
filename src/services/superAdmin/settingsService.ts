import { supabase } from "../supabase";

export async function getPlatformSettings() {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function updatePlatformSettings(settings: any) {
  const { error } = await supabase
    .from("platform_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", settings.id);

  if (error) throw error;
}

export async function uploadPlatformLogo(file: File) {

    const fileName =
        `logo-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
        .from("platform-assets")
        .upload(fileName, file, {
            upsert: true,
        });

    if (error) throw error;

    const {
        data
    } = supabase.storage
        .from("platform-assets")
        .getPublicUrl(fileName);

    return data.publicUrl;
}