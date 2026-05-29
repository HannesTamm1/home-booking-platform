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
            $table->string('destination')->nullable()->index();
            $table->text('description')->nullable();
            $table->unsignedInteger('price_per_night_cents');
            $table->char('currency', 3)->default('EUR');
            $table->unsignedSmallInteger('max_guests');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 11, 7)->nullable();
            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE listings ADD CONSTRAINT listings_price_check CHECK (price_per_night_cents >= 0)');
            DB::statement('ALTER TABLE listings ADD CONSTRAINT listings_max_guests_check CHECK (max_guests > 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
