import { supabase } from "../supabase";

interface LoginData {
  email: string;
  password: string;
}

export async function loginSuperAdmin(
  data: LoginData
) {
  try {
    // Login using Supabase Auth
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error("User not found.");
    }

    // Fetch super admin profile
    const {
      data: admin,
      error: adminError,
    } = await supabase
      .from("super_admins")
      .select("*")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (adminError) {
      throw adminError;
    }

    return {
      success: true,
      admin,
    };
  } catch (error) {
    console.error("Super Admin Login Error:", error);

    return {
      success: false,
      error,
    };
  }
}

export async function logoutSuperAdmin() {
  await supabase.auth.signOut();

  return {
    success: true,
  };
}

export async function getCurrentSuperAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: admin } = await supabase
    .from("super_admins")
    .select("*")
    .eq("auth_user_id", session.user.id)
    .single();

  return admin;
}