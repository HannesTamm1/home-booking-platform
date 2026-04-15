<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->decimal('price_per_night');
            $table->unsignedInteger('max_guests');
            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE listings ADD CONSTRAINT listings_price_per_night_check CHECK (price_per_night >= 0)');
            DB::statement('ALTER TABLE listings ADD CONSTRAINT listings_max_guests_check CHECK (max_guests > 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
