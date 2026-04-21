<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ListListingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => [
                'sometimes',
                'integer',
                'min:1',
                'max:'.config('api.pagination.max_per_page'),
            ],
            'destination' => ['sometimes', 'string', 'max:255'],
            'guests' => ['sometimes', 'integer', 'min:1'],
            'check_in' => ['sometimes', 'date', 'required_with:check_out'],
            'check_out' => ['sometimes', 'date', 'required_with:check_in', 'after:check_in'],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', (int) config('api.pagination.default_per_page'));
    }

    /**
     * @return array{destination: string|null, guests: int|null, check_in: string|null, check_out: string|null}
     */
    public function filters(): array
    {
        return [
            'destination' => $this->string('destination')->trim()->value() ?: null,
            'guests' => $this->filled('guests') ? $this->integer('guests') : null,
            'check_in' => $this->input('check_in'),
            'check_out' => $this->input('check_out'),
        ];
    }
}
