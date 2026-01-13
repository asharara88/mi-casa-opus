-- Ensure Operator has full access on all tables by updating to PERMISSIVE policies

-- Drop and recreate Operator policies as PERMISSIVE for full access

-- profiles table
DROP POLICY IF EXISTS "Operators can manage all profiles" ON profiles;
CREATE POLICY "Operators can manage all profiles" ON profiles FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- broker_profiles table
DROP POLICY IF EXISTS "Operators can manage broker profiles" ON broker_profiles;
CREATE POLICY "Operators can manage broker profiles" ON broker_profiles FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- leads table
DROP POLICY IF EXISTS "Operators can manage leads" ON leads;
CREATE POLICY "Operators can manage leads" ON leads FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- listings table
DROP POLICY IF EXISTS "Operators can manage listings" ON listings;
CREATE POLICY "Operators can manage listings" ON listings FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- deals table
DROP POLICY IF EXISTS "Operators can manage deals" ON deals;
CREATE POLICY "Operators can manage deals" ON deals FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- deal_parties table
DROP POLICY IF EXISTS "Operators can manage deal parties" ON deal_parties;
CREATE POLICY "Operators can manage deal parties" ON deal_parties FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- deal_brokers table
DROP POLICY IF EXISTS "Operators can manage deal brokers" ON deal_brokers;
CREATE POLICY "Operators can manage deal brokers" ON deal_brokers FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- document_templates table
DROP POLICY IF EXISTS "Operators can manage templates" ON document_templates;
CREATE POLICY "Operators can manage templates" ON document_templates FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- document_instances table
DROP POLICY IF EXISTS "Operators can manage documents" ON document_instances;
CREATE POLICY "Operators can manage documents" ON document_instances FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- signature_envelopes table
DROP POLICY IF EXISTS "Operators can manage signatures" ON signature_envelopes;
CREATE POLICY "Operators can manage signatures" ON signature_envelopes FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- evidence_objects table
DROP POLICY IF EXISTS "Operators can manage evidence" ON evidence_objects;
CREATE POLICY "Operators can manage evidence" ON evidence_objects FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- commission_records table
DROP POLICY IF EXISTS "Operators can manage commissions" ON commission_records;
CREATE POLICY "Operators can manage commissions" ON commission_records FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- ai_insights table
DROP POLICY IF EXISTS "Operators can manage insights" ON ai_insights;
CREATE POLICY "Operators can manage insights" ON ai_insights FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- approvals table
DROP POLICY IF EXISTS "Operators and LegalOwners can manage approvals" ON approvals;
CREATE POLICY "Operators can manage approvals" ON approvals FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- payout_batches table
DROP POLICY IF EXISTS "Operators can manage payouts" ON payout_batches;
CREATE POLICY "Operators can manage payouts" ON payout_batches FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- payout_lines table
DROP POLICY IF EXISTS "Operators can manage payout lines" ON payout_lines;
CREATE POLICY "Operators can manage payout lines" ON payout_lines FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- brokerage_context table
DROP POLICY IF EXISTS "Operators can manage brokerage" ON brokerage_context;
CREATE POLICY "Operators can manage brokerage" ON brokerage_context FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- compliance_modules table
DROP POLICY IF EXISTS "Operators can manage compliance modules" ON compliance_modules;
CREATE POLICY "Operators can manage compliance modules" ON compliance_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- compliance_rules table
DROP POLICY IF EXISTS "Operators can manage compliance rules" ON compliance_rules;
CREATE POLICY "Operators can manage compliance rules" ON compliance_rules FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- compliance_results table
DROP POLICY IF EXISTS "Operators can manage compliance results" ON compliance_results;
CREATE POLICY "Operators can manage compliance results" ON compliance_results FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- user_roles table
DROP POLICY IF EXISTS "Operators can manage roles" ON user_roles;
CREATE POLICY "Operators can manage roles" ON user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- event_log_entries - operators should have full access
CREATE POLICY "Operators can manage event log" ON event_log_entries FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));

-- compliance_overrides - operators should have full access including update/delete
CREATE POLICY "Operators can manage overrides" ON compliance_overrides FOR ALL TO authenticated USING (has_role(auth.uid(), 'Operator'::app_role)) WITH CHECK (has_role(auth.uid(), 'Operator'::app_role));