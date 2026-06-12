<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('tickets')
            ->where('status', 'closed')
            ->update(['status' => 'resolved']);

        DB::table('ticket_status_histories')
            ->where('from_status', 'closed')
            ->update(['from_status' => 'resolved']);

        DB::table('ticket_status_histories')
            ->where('to_status', 'closed')
            ->update(['to_status' => 'resolved']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement(
                "ALTER TABLE tickets MODIFY status ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open'"
            );
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement(
                "ALTER TABLE tickets MODIFY status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open'"
            );
        }
    }
};
