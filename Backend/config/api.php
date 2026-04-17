<?php

return [
    'pagination' => [
        'default_per_page' => (int) env('API_LISTINGS_DEFAULT_PER_PAGE', 12),
        'max_per_page' => (int) env('API_LISTINGS_MAX_PER_PAGE', 50),
    ],

    'rate_limit_per_minute' => (int) env('API_RATE_LIMIT_PER_MINUTE', 60),
];
