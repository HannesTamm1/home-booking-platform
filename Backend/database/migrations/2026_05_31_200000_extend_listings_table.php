<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->string('status')->default('published')->index()->after('host_id');
            $table->string('property_type')->nullable()->after('status');
            $table->unsignedSmallInteger('bedrooms')->default(1)->after('max_guests');
            $table->unsignedSmallInteger('beds')->default(1)->after('bedrooms');
            $table->decimal('bathrooms', 3, 1)->default(1)->after('beds');
            $table->json('amenities')->nullable()->after('bathrooms');
            $table->string('booking_type')->default('instant')->after('amenities');
            $table->unsignedSmallInteger('min_nights')->default(1)->after('booking_type');
            $table->unsignedInteger('weekend_price_per_night_cents')->nullable()->after('price_per_night_cents');
            $table->text('house_rules')->nullable()->after('description');
            $table->decimal('rating_average', 3, 2)->nullable()->after('house_rules');
            $table->unsignedInteger('rating_count')->default(0)->after('rating_average');
        });

        // Mark all existing listings as published so they remain visible
        DB::table('listings')->update(['status' => 'published']);
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn([
                'status', 'property_type', 'bedrooms', 'beds', 'bathrooms',
                'amenities', 'booking_type', 'min_nights', 'weekend_price_per_night_cents',
                'house_rules', 'rating_average', 'rating_count',
            ]);
        });
    }
};
