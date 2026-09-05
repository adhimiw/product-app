<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordResetOtp extends Model
{
    protected $table = 'password_reset_otps';

    protected $fillable = [
        'email',
        'otp_hash',
        'attempts',
        'max_attempts',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'attempts' => 'integer',
        'max_attempts' => 'integer',
    ];

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isMaxAttemptsReached(): bool
    {
        return $this->attempts >= $this->max_attempts;
    }
}
