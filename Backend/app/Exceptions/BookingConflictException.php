<?php

namespace App\Exceptions;

use RuntimeException;

class BookingConflictException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The requested dates are not available.');
    }
}
