<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->boolean('is_blocked')->default(false);
            $table->unsignedInteger('custom_price_cents')->nullable();
            $table->timestamps();

            $table->unique(['listing_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_days');
    }
};
