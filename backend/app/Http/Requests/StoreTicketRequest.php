<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string'],
            'requester_name' => ['nullable', 'string', 'max:100'],
            'requester_email' => ['nullable', 'email', 'max:150'],
            'category' => [
                'required',
                'string',
                Rule::in([
                    'Masalah Teknis',
                    'Pertanyaan',
                    'Feedback',
                    'Permintaan Fitur',
                    'Lainnya',
                ]),
            ],
            'priority' => ['nullable', 'in:low,medium,high'],
        ];
    }

    public function messages(): array
    {
        return [
            'category.required' => 'Jenis laporan wajib dipilih.',
            'category.in' => 'Jenis laporan yang dipilih tidak valid.',
        ];
    }
}
