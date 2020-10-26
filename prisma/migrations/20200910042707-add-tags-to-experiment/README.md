# Migration `20200910042707-add-tags-to-experiment`

This migration has been generated by Sebastian Jeong at 9/10/2020, 1:27:07 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Experiment" ADD COLUMN "tags" text
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200901042124-psql1..20200910042707-add-tags-to-experiment
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model Experiment {
   id          String    @default("unset") @id
@@ -17,8 +17,9 @@
   json        String?   @default("{}")
   User        User?     @relation(fields: [userEmail], references: [email])
   Result      Result[]
   Project     Project[]
+  tags        String?
 }
 model User {
   email      String       @default("unset@monet.com") @id
```