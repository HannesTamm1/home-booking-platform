<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Platform takes 15 %; host keeps 85 %
    private const HOST_SHARE = 0.85;

    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedInteger('host_payout_cents')->nullable()->after('total_price_cents');
            $table->timestamp('payout_released_at')->nullable()->after('host_payout_cents');
        });

        // Back-fill existing confirmed bookings
        DB::table('bookings')
            ->where('status', 'confirmed')
            ->whereNull('host_payout_cents')
            ->update([
                'host_payout_cents' => DB::raw('FLOOR(total_price_cents * ' . self::HOST_SHARE . ')'),
            ]);
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['host_payout_cents', 'payout_released_at']);
        });
    }
};
