import {
  getMemberById,
  getMemberByEmail,
  updateMember,
  deactivateMember,
} from "../../services/member/memberService";

export function useMemberProfile() {
  return {
    getMemberById,
    getMemberByEmail,
    updateMember,
    deactivateMember,
  };
}