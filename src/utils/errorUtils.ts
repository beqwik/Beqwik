/**
 * Utility to sanitize raw database and API errors into clean, user-friendly messages.
 */
export function sanitizeErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const raw = typeof error === "string" 
    ? error 
    : error.message || error.error_description || error.details || JSON.stringify(error);

  const lower = raw.toLowerCase();

  // Unique key constraint / Duplicate record errors
  if (
    lower.includes("unique constraint") ||
    lower.includes("already exists") ||
    lower.includes("members_email_key") ||
    lower.includes("duplicate key")
  ) {
    if (lower.includes("staff_code")) {
      return "This Staff ID is already assigned. Please use a unique Staff ID allotted by your admin.";
    }
    if (lower.includes("student_code")) {
      return "This Student ID is already assigned. Please check the student code.";
    }
    return "An account with this email address is already registered. Please sign in or use a different email address.";
  }

  // Authentication & Login errors
  if (
    lower.includes("invalid login") ||
    lower.includes("invalid credentials") ||
    lower.includes("wrong password") ||
    lower.includes("invalid grant")
  ) {
    return "Incorrect email, organization code, or password. Please check your credentials and try again.";
  }

  if (lower.includes("email not confirmed")) {
    return "Please confirm your email address before logging in.";
  }

  // Connection & Network errors
  if (
    lower.includes("fetch") ||
    lower.includes("network") ||
    lower.includes("failed to send") ||
    lower.includes("connection refused")
  ) {
    return "Unable to reach the server. Please check your internet connection and try again.";
  }

  // Database Column / Constraint errors
  if (lower.includes("null value in column") || lower.includes("violates not-null constraint")) {
    return "Please fill in all required fields accurately before submitting.";
  }

  // Human-readable fallback for short non-technical text strings
  if (!raw.includes("{") && !raw.includes("postgres") && !raw.includes("column") && raw.length < 120) {
    return raw;
  }

  return "Something went wrong while processing your request. Please try again.";
}
