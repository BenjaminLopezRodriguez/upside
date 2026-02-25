-- Cards issued by an org to a user (personal view shows only these)
ALTER TABLE "upside_card" ADD COLUMN IF NOT EXISTS "organizationId" integer;
CREATE INDEX IF NOT EXISTS "card_org_idx" ON "upside_card" ("organizationId");
ALTER TABLE "upside_card" ADD CONSTRAINT "upside_card_organizationId_organization_id_fk"
  FOREIGN KEY ("organizationId") REFERENCES "public"."upside_organization"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
