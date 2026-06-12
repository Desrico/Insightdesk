<?php

namespace App\Services;

class SensitiveDataMasker
{
    public function mask(string $value): string
    {
        $value = preg_replace(
            '/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i',
            '[EMAIL_REDACTED]',
            $value
        );

        return preg_replace(
            '/(?<!\d)(?:\+?62|0)[\d\s().-]{8,16}\d(?!\d)/',
            '[PHONE_REDACTED]',
            $value
        );
    }
}
