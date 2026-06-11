<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Ticket extends Model
{
    protected $fillable = [
        'title',
        'description',
        'requester_name',
        'requester_email',
        'category',
        'priority',
        'status',
        'version',
    ];

    public function statusHistories(): HasMany
    {
        return $this->hasMany(TicketStatusHistory::class);
    }

    public function aiAnalysis(): HasOne
    {
        return $this->hasOne(TicketAiAnalysis::class);
    }
}