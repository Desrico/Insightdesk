<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_ticket_list_returns_successful_response(): void
    {
        $response = $this->get('/api/tickets');

        $response->assertStatus(200);
    }
}
