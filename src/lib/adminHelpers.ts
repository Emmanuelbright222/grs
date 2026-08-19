import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DeleteArtistResult {
  success: boolean;
  error?: string;
}

export async function deleteArtistProfile(userId: string): Promise<DeleteArtistResult> {
  try {
    const { error: rpcError } = await supabase.rpc("admin_delete_artist_profile", {
      target_user_id: userId,
    });

    if (rpcError) {
      logger.warn("RPC deletion failed, falling back to direct table deletion", { rpcError });

      const { error: directError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (directError) throw directError;
    }

    return { success: true };
  } catch (err: any) {
    logger.error("Failed to delete artist profile", err);
    return {
      success: false,
      error: err.message || "Failed to delete artist profile.",
    };
  }
}

export async function uploadPublicAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return { url: data.publicUrl };
  } catch (err: any) {
    logger.error("Failed to upload avatar", err);
    return { url: null, error: err.message || "Failed to upload avatar image." };
  }
}
