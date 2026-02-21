-- ============================================================
-- VerifiedMeasure — Supabase Validation (READ ONLY)
-- ============================================================

-- 1) Confirm required vertical tables exist
select n.nspname as schema, c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'companies','company_access',
    'b2b_leads','lead_access',
    'suppliers','supplier_access',
    'clinical_trials','trial_access',
    'legal_cases','case_access',
    'market_entities','entity_access',
    'papers','paper_access',
    'creators','creator_access',
    'game_studios','studio_access',
    'properties','property_access',
    'private_companies','pc_company_access',
    'organizations','org_access',
    'drug_programs','program_access',
    'industrial_facilities','facility_access',
    'gov_opportunities','opportunity_access',
    'insurance_accounts','account_access',
    'credit_ledger',
    'user_profiles'
  )
order by c.relname;

-- 2) Confirm required unlock RPCs exist
select
  p.oid::regprocedure::text as signature,
  p.proname
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
  and p.proname in (
    'unlock_companies_secure',
    'unlock_leads_secure',
    'unlock_suppliers_secure',
    'unlock_trials_secure',
    'unlock_cases_secure',
    'unlock_entities_secure',
    'unlock_papers_secure',
    'unlock_creators_secure',
    'unlock_studios_secure',
    'unlock_properties_secure',
    'unlock_private_companies_secure',
    'unlock_organizations_secure',
    'unlock_programs_secure',
    'unlock_facilities_secure',
    'unlock_opportunities_secure',
    'unlock_accounts_secure'
  )
order by p.proname;

-- 3) Confirm RLS is enabled on key tables (expected TRUE)
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname='public'
  and c.relkind='r'
  and c.relname in (
    'companies','company_access',
    'b2b_leads','lead_access',
    'suppliers','supplier_access',
    'clinical_trials','trial_access',
    'legal_cases','case_access',
    'market_entities','entity_access',
    'papers','paper_access',
    'creators','creator_access',
    'game_studios','studio_access',
    'properties','property_access',
    'private_companies','pc_company_access',
    'organizations','org_access',
    'drug_programs','program_access',
    'industrial_facilities','facility_access',
    'gov_opportunities','opportunity_access',
    'insurance_accounts','account_access',
    'credit_ledger',
    'user_profiles'
  )
order by c.relname;

-- 4) Sanity check: expected credit_ledger columns exist
select
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema='public'
  and table_name='credit_ledger'
order by ordinal_position;

-- 5) Example credit balance query (replace with an actual user UUID when testing in SQL editor)
-- select coalesce(sum(delta),0) as credit_balance
-- from public.credit_ledger
-- where user_id = '00000000-0000-0000-0000-000000000000';

-- 6) Example access lookup query (replace UUID)
-- select company_id
-- from public.company_access
-- where user_id = '00000000-0000-0000-0000-000000000000'
-- order by created_at desc
-- limit 50;
