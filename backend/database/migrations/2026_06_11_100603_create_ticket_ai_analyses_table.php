<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
{
    Schema::create('ticket_ai_analyses', function (Blueprint $table) {
        $table->id();
        $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
        $table->text('summary')->nullable();
        $table->string('category')->nullable();
        $table->string('sentiment')->nullable();
        $table->string('priority_suggestion')->nullable();
        $table->text('recommendation')->nullable();
        $table->json('raw_response')->nullable();
        $table->timestamp('analyzed_at')->nullable();
        $table->timestamps();
    });
}


    public function down(): void
    {
        Schema::dropIfExists('ticket_ai_analyses');
    }
};
