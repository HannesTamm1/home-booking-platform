<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('listings')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_price', 10, 2);
            $table->string('status')->index();
            $table->timestamps();

            $table->index(['listing_id', 'start_date', 'end_date']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE bookings ADD CONSTRAINT bookings_total_price_check CHECK (total_price >= 0)');
            DB::statement('ALTER TABLE bookings ADD CONSTRAINT bookings_date_range_check CHECK (end_date >= start_date)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
