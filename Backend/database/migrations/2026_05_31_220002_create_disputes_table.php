<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('opened_by_id')->constrained('users');
            $table->string('status')->default('open')->index();  // open | resolved
            $table->string('resolution')->nullable();            // refund_guest | side_with_host | partial
            $table->unsignedInteger('refund_amount_cents')->nullable();
            $table->text('description');
            $table->text('admin_note')->nullable();
            $table->foreignId('resolved_by_id')->nullable()->constrained('users');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
