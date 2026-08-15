<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductPackageSize;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks to wipe existing product data cleanly
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        ProductPackageSize::truncate();
        Product::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $catAncestral = Category::firstOrCreate(
            ['name' => 'Ancestral Health Mixes'],
            ['slug' => 'ancestral-health-mixes', 'status' => 1]
        );

        $catRice = Category::firstOrCreate(
            ['name' => 'Heritage Mappillai Rice'],
            ['slug' => 'heritage-mappillai-rice', 'status' => 1]
        );

        $catMillets = Category::firstOrCreate(
            ['name' => 'Soak-Sprouted Millets'],
            ['slug' => 'soak-sprouted-millets', 'status' => 1]
        );

        $catSethiyathope = Category::firstOrCreate(
            ['name' => 'Sethiyathope Artisanal Blends'],
            ['slug' => 'sethiyathope-artisanal-blends', 'status' => 1]
        );

        $products = [
            [
                'name'           => 'Amutham Sprouted Health Mix',
                'category_id'    => $catAncestral->id,
                'category'       => $catAncestral->name,
                'description'    => 'Traditional ancestral health mix crafted with 14+ organic soak-sprouted millets, pulses, and nuts. High fiber, rich in natural protein, and 100% preservative-free.',
                'actual_price'   => 140,
                'discount_type'  => 1,
                'discount_value' => 30,
                'status'         => 1,
                'stock'          => 150,
                'how_to_use'     => 'Mix 2-3 tbsp with 250ml water or milk. Cook on medium flame for 5 minutes stirring continuously. Add jaggery or salt to taste.',
                'benefits'       => "Supports immune health\nImproves digestion & gut health\nRich in bioavailable calcium & iron\nSustained energy throughout the day",
                'ingredients'    => 'Sprouted Ragi, Sprouted Bajra, Sprouted Jowar, Green Gram, Almonds, Cashews, Cardamom, Dry Ginger.',
                'tags'           => ['sprouted', 'health-mix', 'best-seller', 'organic'],
                'images'         => [
                    '/assets/images/500g_Amutham/1000330151.jpg.jpeg',
                    '/assets/images/500g_Amutham/11cm 13cm outline-01.jpg',
                    '/assets/images/500g_Amutham/11cm 13cm outline-02.jpg',
                    '/assets/images/500g_Amutham/Picsart_26-08-06_11-44-10-447.jpg.jpeg',
                    '/assets/images/500g_Amutham/Picsart_26-08-06_12-10-06-119.jpg.jpeg'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '300g',
                        'size_number'    => 300,
                        'size_unit'      => 'g',
                        'variant_price'  => 110,
                        'variant_badge'  => 1, // Best Seller
                        'stock'          => 50,
                        'discount_type'  => 1,
                        'discount_value' => 15,
                    ],
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 160,
                        'variant_badge'  => 2, // Family Pack
                        'stock'          => 100,
                        'discount_type'  => 1,
                        'discount_value' => 30,
                    ],
                    [
                        'size_key'       => '1000g',
                        'size_number'    => 1000,
                        'size_unit'      => 'g',
                        'variant_price'  => 300,
                        'variant_badge'  => 4, // Family Value
                        'stock'          => 40,
                        'discount_type'  => 1,
                        'discount_value' => 40,
                    ]
                ]
            ],
            [
                'name'           => 'Mangalam Black Ulundhu Mix',
                'category_id'    => $catAncestral->id,
                'category'       => $catAncestral->name,
                'description'    => 'Traditional Black Ulundhu (Black Gram) mix enriched with sprouted millets and herbs. Traditional recipe for back-bone strength, joint health, and energy.',
                'actual_price'   => 220,
                'discount_type'  => 1,
                'discount_value' => 40,
                'status'         => 1,
                'stock'          => 90,
                'how_to_use'     => 'Boil 3 tbsp with milk or buttermilk for 5-7 minutes. Enjoy warm.',
                'benefits'       => "Strengthens bones & spine\nRich in protein & iron\nTraditional nourishment for joints and vital energy",
                'ingredients'    => 'Black Ulundhu (Whole Black Gram), Sprouted Finger Millet, Raw Rice, Cardamom, Dry Ginger.',
                'tags'           => ['uluntham', 'black-gram', 'traditional'],
                'images'         => [
                    '/assets/images/500g_Mangalam/1000330136.png',
                    '/assets/images/500g_Mangalam/Black Ulundhu Mix-11cm 13cm outline-01.jpg',
                    '/assets/images/500g_Mangalam/Black Ulundhu Mix-11cm 13cm outline-02.jpg',
                    '/assets/images/500g_Mangalam/Picsart_26-08-06_11-56-39-999.jpg.jpeg',
                    '/assets/images/500g_Mangalam/Picsart_26-08-06_12-17-35-692.jpg.jpeg'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '300g',
                        'size_number'    => 300,
                        'size_unit'      => 'g',
                        'variant_price'  => 120,
                        'variant_badge'  => 1,
                        'stock'          => 40,
                        'discount_type'  => 1,
                        'discount_value' => 20,
                    ],
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 180,
                        'variant_badge'  => 3,
                        'stock'          => 50,
                        'discount_type'  => 1,
                        'discount_value' => 40,
                    ]
                ]
            ],
            [
                'name'           => 'Heritage Mappillai Samba Rice Blend',
                'category_id'    => $catRice->id,
                'category'       => $catRice->name,
                'description'    => 'Ancient Tamil red rice variety renowned for boosting stamina, strength, and vitality. Stone-ground and slow roasted.',
                'actual_price'   => 190,
                'discount_type'  => 1,
                'discount_value' => 30,
                'status'         => 1,
                'stock'          => 60,
                'how_to_use'     => 'Mix 2 tbsp with warm water or milk, simmer for 5 minutes. Best consumed in morning.',
                'benefits'       => "Increases stamina & physical strength\nRich in iron & zinc\nLow glycemic index for sustained energy",
                'ingredients'    => 'Mappillai Samba Red Rice, Sprouted Ragi, Cardamom.',
                'tags'           => ['mappillai-samba', 'heritage-rice', 'stamina'],
                'images'         => ['/assets/images/categories/rice.png'],
                'package_sizes'  => [
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 160,
                        'variant_badge'  => 3,
                        'stock'          => 60,
                        'discount_type'  => 1,
                        'discount_value' => 30,
                    ]
                ]
            ],
            [
                'name'           => 'Sprouted Ragi & Multi-Millet Mix',
                'category_id'    => $catMillets->id,
                'category'       => $catMillets->name,
                'description'    => '100% sprouted ragi and millet blend optimized for maximum calcium absorption and easy digestion.',
                'actual_price'   => 150,
                'discount_type'  => 1,
                'discount_value' => 25,
                'status'         => 1,
                'stock'          => 80,
                'how_to_use'     => 'Mix with water or milk, cook for 4-5 mins. Add jaggery or salt.',
                'benefits'       => "High bioavailable calcium\nGentle on stomach\nIdeal for toddlers, kids, and adults",
                'ingredients'    => 'Sprouted Finger Millet, Little Millet, Kodo Millet, Cardamom.',
                'tags'           => ['ragi', 'millets', 'digestive-care'],
                'images'         => ['/assets/images/sprouted_millet_bowl.png'],
                'package_sizes'  => [
                    [
                        'size_key'       => '300g',
                        'size_number'    => 300,
                        'size_unit'      => 'g',
                        'variant_price'  => 75,
                        'variant_badge'  => 0,
                        'stock'          => 30,
                        'discount_type'  => 1,
                        'discount_value' => 15,
                    ],
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 125,
                        'variant_badge'  => 0,
                        'stock'          => 50,
                        'discount_type'  => 1,
                        'discount_value' => 25,
                    ]
                ]
            ],
            [
                'name'           => 'Sethiyathope Special Digestive Care Blend',
                'category_id'    => $catSethiyathope->id,
                'category'       => $catSethiyathope->name,
                'description'    => 'Hand-crafted in Sethiyathope facility using traditional wood-fire roasting with digestive herbs like ajwain and dry ginger.',
                'actual_price'   => 175,
                'discount_type'  => 1,
                'discount_value' => 30,
                'status'         => 1,
                'stock'          => 45,
                'how_to_use'     => 'Mix 2 tbsp with warm water, cook 3-4 mins. Consume warm after meal.',
                'benefits'       => "Relieves bloating & heaviness\nAids gut digestion\nEnhances metabolic absorption",
                'ingredients'    => 'Sprouted Mung, Ajwain, Dry Ginger, Jeera, Sprouted Millets.',
                'tags'           => ['artisanal', 'sethiyathope', 'digestive'],
                'images'         => ['/assets/images/sethiyathope_facility.png'],
                'package_sizes'  => [
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 145,
                        'variant_badge'  => 3,
                        'stock'          => 45,
                        'discount_type'  => 1,
                        'discount_value' => 30,
                    ]
                ]
            ]
        ];

        foreach ($products as $prodData) {
            $sizes = $prodData['package_sizes'];
            unset($prodData['package_sizes']);

            $product = Product::create($prodData);

            foreach ($sizes as $sizeData) {
                $sizeData['product_id'] = $product->id;
                ProductPackageSize::create($sizeData);
            }
        }
    }
}
