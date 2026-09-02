-- PostGIS + delivery coordinates.
-- Requires the postgis extension (provisioned separately — see
-- apps/api/README.md — Prisma's `extensions = [postgis]` datasource
-- setting does not itself install the Postgres extension, it only tells
-- the client generator to expect it).

CREATE EXTENSION IF NOT EXISTS postgis;

-- AlterTable
ALTER TABLE "ports" ADD COLUMN     "geog" geography(Point,4326);

-- AlterTable
ALTER TABLE "tenders" ADD COLUMN     "deliveryLat" DOUBLE PRECISION,
ADD COLUMN     "deliveryLng" DOUBLE PRECISION;

-- Backfill geog from the existing lat/lng floats for any already-seeded
-- ports, and index it for the nearest-port query in routes/ports.ts.
UPDATE "ports" SET "geog" = ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)::geography WHERE "geog" IS NULL;

CREATE INDEX IF NOT EXISTS "ports_geog_idx" ON "ports" USING GIST ("geog");

-- Keep geog in sync with lat/lng automatically (ports are static reference
-- data seeded rarely, but this makes the two columns impossible to drift).
CREATE OR REPLACE FUNCTION ports_sync_geog() RETURNS trigger AS $$
BEGIN
  NEW."geog" = ST_SetSRID(ST_MakePoint(NEW."lng", NEW."lat"), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ports_sync_geog_trigger ON "ports";
CREATE TRIGGER ports_sync_geog_trigger
  BEFORE INSERT OR UPDATE OF "lat", "lng" ON "ports"
  FOR EACH ROW EXECUTE FUNCTION ports_sync_geog();
