<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');
            DB::statement('ALTER TABLE listings ADD COLUMN coordinates geography(Point,4326) NULL');
            DB::statement('CREATE INDEX listings_coordinates_gist_idx ON listings USING GIST (coordinates)');
        } catch (Exception $e) {
            // PostGIS not available in this environment; coordinates stored via latitude/longitude columns.
            echo "  [warn] Skipping geography column: PostGIS not installed ({$e->getMessage()})\n";
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        try {
            DB::statement('DROP INDEX IF EXISTS listings_coordinates_gist_idx');
            DB::statement('ALTER TABLE listings DROP COLUMN IF EXISTS coordinates');
        } catch (Exception $e) {
            // Column may not exist if PostGIS was unavailable during up().
        }
    }
};
