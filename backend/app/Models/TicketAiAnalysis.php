<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketAiAnalysis extends Model
{
    protected $fillable = [
        'ticket_id',
        'summary',
        'category',
        'sentiment',
        'priority_suggestion',
        'recommendation',
        'raw_response',
        'analyzed_at',
    ];

    protected $casts = [
        'raw_response' => 'array',
        'analyzed_at' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }
}