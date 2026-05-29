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

        // btree_gist lets btree-comparable types (integer, varchar) participate
        // in GiST exclusion constraints alongside range types.
        DB::statement('CREATE EXTENSION IF NOT EXISTS btree_gist');

        // Prevent two CONFIRMED bookings from occupying the same listing on
        // overlapping date ranges.  Half-open intervals mean check-out day is
        // free for a same-day check-in.
        DB::statement('
            ALTER TABLE bookings
            ADD CONSTRAINT bookings_no_overlap_confirmed
            EXCLUDE USING GIST (
                listing_id  WITH =,
                daterange(start_date, end_date, \'[)\') WITH &&
            )
            WHERE (status = \'confirmed\')
        ');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap_confirmed');
    }
};
