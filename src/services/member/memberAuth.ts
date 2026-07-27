import { supabase } from "../supabase";

interface RegisterMemberData {
  organizationCode: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
}

interface LoginMemberData {
  organizationCode: string;
  email: string;
  password: string;
}

// ====================
// REGISTER MEMBER
// ====================
export async function registerMember(
  data: RegisterMemberData
) {
  try {
    const { data: response, error } =
      await supabase.functions.invoke(
        "member-register",
        {
          body: data,
        }
      );

    if (error) {
      throw error;
    }

    if (!response.success) {
      throw new Error(response.error);
    }

    return {
      success: true,
      member: response.member,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Registration failed",
    };
  }
}

// ====================
// LOGIN MEMBER
// ====================
export async function loginMember(
  data: LoginMemberData
) {
  try {
    const { data: response, error } =
      await supabase.functions.invoke(
        "member-login",
        {
          body: data,
        }
      );

    if (error) {
      throw error;
    }

    if (!response.success) {
      throw new Error(response.error);
    }

    // Save session locally
    localStorage.setItem(
      "member",
      JSON.stringify(response.member)
    );

    localStorage.setItem(
      "organization",
      JSON.stringify(response.organization)
    );

    return {
      success: true,
      member: response.member,
      organization: response.organization,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Login failed",
    };
  }
}

// ====================
// GET CURRENT MEMBER
// ====================
export function getCurrentMember() {
  const member = localStorage.getItem("member");

  if (!member) return null;

  return JSON.parse(member);
}

// ====================
// GET CURRENT ORGANIZATION
// ====================
export function getCurrentOrganization() {
  const organization =
    localStorage.getItem("organization");

  if (!organization) return null;

  return JSON.parse(organization);
}

// ====================
// LOGOUT MEMBER
// ====================
export function logoutMember() {
  localStorage.removeItem("member");
  localStorage.removeItem("organization");

  return {
    success: true,
  };
}