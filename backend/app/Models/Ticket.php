<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}