<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@mangalam.com'],
            [
                'full_name'      => 'Super Admin',
                'contact_number' => '1234567890',
                'password'       => Hash::make('12345678'),
                'role'           => User::ROLE_SUPER_ADMIN,
            ]
        );

        $defaultCategories = [
            'Ancestral Health Mixes',
            'Heritage Mappillai Rice',
            'Soak-Sprouted Millets',
            'Sethiyathope Artisanal Blends',
        ];

        foreach ($defaultCategories as $catName) {
            \App\Models\Category::firstOrCreate(
                ['name' => $catName],
                [
                    'slug'   => \Illuminate\Support\Str::slug($catName),
                    'status' => 1,
                ]
            );
        }

        $this->call(ProductSeeder::class);
    }
}
