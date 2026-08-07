-- =====================================================
-- DROP FK CONSTRAINTS ON subscriptions & payment_transactions member_id
-- This allows member_id to reference either members.id
-- (non-gym orgs) or gym_members.id (gym orgs).
-- =====================================================

ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_member_id_fkey;

ALTER TABLE public.payment_transactions
    DROP CONSTRAINT IF EXISTS payment_transactions_member_id_fkey;
