import { loginMember, logoutMember, registerMember } from "../../services/member/memberAuth";

export function useMemberAuth() {
  return {
    registerMember,
    loginMember,
    logoutMember,
  };
}