import { supabase } from "../supabase";

export async function generateOrganizationCode(
  organizationName: string
) {
  try {
    // Generate prefix from initials
    let prefix = organizationName
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    // Fallback for single-word names
    if (prefix.length < 3) {
      prefix = organizationName
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 3)
        .toUpperCase();
    }

    prefix = prefix.substring(0, 3);

    // Count existing organizations with same prefix
    const { data, error } = await supabase
      .from("organizations")
      .select("organization_code")
      .like("organization_code", `${prefix}%`);

    if (error) throw error;

    const nextNumber = (data?.length || 0) + 1;

    return `${prefix}${String(nextNumber).padStart(
      3,
      "0"
    )}`;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createOrganization({
  organizationName,
  organizationType,
  email,
  phone,
  address,
}: {
  organizationName: string;
  organizationType: string;
  email: string;
  phone: string;
  address: string;
}) {
  try {
    const organizationCode =
      await generateOrganizationCode(
        organizationName
      );

    const { data, error } = await supabase
      .from("organizations")
      .insert({
        organization_name: organizationName,
        organization_type: organizationType,
        email,
        phone,
        address,
        organization_code: organizationCode,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      organization: data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error,
    };
  }
}

export async function getOrganizationById(
  organizationId: string
) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .single();

  if (error) throw error;

  return data;
}

export async function getOrganizationByCode(
  organizationCode: string
) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("organization_code", organizationCode)
    .single();

  if (error) throw error;

  return data;
}

export async function updateOrganization(
  organizationId: string,
  payload: any
) {
  const { data, error } = await supabase
    .from("organizations")
    .update(payload)
    .eq("id", organizationId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
