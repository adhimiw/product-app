<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductPackageSize;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks to wipe and re-seed cleanly
        Schema::disableForeignKeyConstraints();
        ProductPackageSize::truncate();
        Product::truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Ancestral Health Mixes / Millets & Grains
        $catMillets = Category::firstOrCreate(
            ['name' => 'Millets and Grains'],
            [
                'slug'        => 'millets-and-grains',
                'description' => 'Nutrient-rich soak-sprouted millets, ancestral porridge mixes, and whole grain formulations.',
                'image'       => '/assets/images/sprouted_millet_bowl.png',
                'status'      => 1,
            ]
        );

        // 2. Heritage & Traditional Rice
        $catRice = Category::firstOrCreate(
            ['name' => 'Heritage & Traditional Rice'],
            [
                'slug'        => 'heritage-traditional-rice',
                'description' => 'Ancient unpolished heirloom rice varieties renowned for stamina, immunity, and low glycemic index.',
                'image'       => 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=800&q=80',
                'status'      => 1,
            ]
        );

        // 3. Cold Wood Pressed Oils
        $catOils = Category::firstOrCreate(
            ['name' => 'Cold Wood Pressed Oils'],
            [
                'slug'        => 'cold-wood-pressed-oils',
                'description' => 'Pure wood-pressed (Mara Chekku) virgin cooking oils extracted at room temperature with zero chemicals.',
                'image'       => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
                'status'      => 1,
            ]
        );

        // 4. Organic Sweeteners & Natural Foods
        $catSweeteners = Category::firstOrCreate(
            ['name' => 'Organic Sweeteners & Natural Foods'],
            [
                'slug'        => 'organic-sweeteners-natural-foods',
                'description' => 'Pure traditional sweeteners, raw Western Ghats honey, and unrefined farm country sugar.',
                'image'       => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
                'status'      => 1,
            ]
        );

        $products = [
            // ==========================================
            // CATEGORY 1: Millets and Grains (3 Products)
            // ==========================================
            [
                'name'           => 'Amutham Sprouted Health Mix',
                'slug'           => 'amutham-sprouted-health-mix',
                'category_id'    => $catMillets->id,
                'category'       => $catMillets->name,
                'description'    => 'Traditional ancestral health mix crafted with 14+ organic soak-sprouted millets, pulses, and dry fruits. Rich in natural plant bio-protein, easy on digestion, and 100% free of artificial preservatives or chemicals.',
                'actual_price'   => 160.00,
                'discount_type'  => 1,
                'discount_value' => 30.00,
                'discount'       => '₹30 OFF',
                'status'         => 1,
                'stock'          => 150,
                'how_to_use'     => "1. Mix 2-3 tablespoons of powder with 250ml of water or milk without lumps.\n2. Cook on medium heat for 4-5 minutes while stirring continuously.\n3. Add jaggery, country sugar, or a pinch of salt to taste. Serve warm.",
                'benefits'       => "• Boosts natural immunity and stamina\n• Enhanced gut bioavailability via soak-sprouting\n• Rich in plant-based calcium, iron & dietary fiber\n• Ideal daily morning energy for all age groups",
                'ingredients'    => 'Sprouted Finger Millet (Ragi), Sprouted Pearl Millet (Bajra), Sprouted Sorghum (Jowar), Green Gram, Roasted Gram, Almonds, Cashews, Cardamom, Dry Ginger.',
                'tags'           => ['sprouted', 'health-mix', 'best-seller', 'organic', 'immunity'],
                'images'         => [
                    '/assets/images/500g_Amutham/1000330151.jpg.jpeg',
                    '/assets/images/500g_Amutham/11cm 13cm outline-01.jpg',
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '300g',
                        'size_number'    => 300,
                        'size_unit'      => 'g',
                        'variant_price'  => 110.00,
                        'variant_badge'  => 1, // Best Seller
                        'stock'          => 50,
                        'discount_type'  => 1,
                        'discount_value' => 15.00,
                        'images'         => ['/assets/images/500g_Amutham/1000330151.jpg.jpeg']
                    ],
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 160.00,
                        'variant_badge'  => 2, // Family Pack
                        'stock'          => 100,
                        'discount_type'  => 1,
                        'discount_value' => 30.00,
                        'images'         => ['/assets/images/500g_Amutham/1000330151.jpg.jpeg']
                    ],
                    [
                        'size_key'       => '1000g',
                        'size_number'    => 1000,
                        'size_unit'      => 'g',
                        'variant_price'  => 300.00,
                        'variant_badge'  => 4, // Super Saver
                        'stock'          => 40,
                        'discount_type'  => 1,
                        'discount_value' => 50.00,
                        'images'         => ['/assets/images/500g_Amutham/1000330151.jpg.jpeg']
                    ]
                ]
            ],
            [
                'name'           => 'Mangalam Sprouted Ulundham Mix',
                'slug'           => 'mangalam-sprouted-ulundham-mix',
                'category_id'    => $catMillets->id,
                'category'       => $catMillets->name,
                'description'    => 'Ancient Tamil recipe of whole soak-sprouted Black Gram (Karuppu Ulundhu) blended with sprouted millets and digestive herbs. Revered for spinal bone strength, joint flexibility, and maternal nutrition.',
                'actual_price'   => 180.00,
                'discount_type'  => 1,
                'discount_value' => 40.00,
                'discount'       => '₹40 OFF',
                'status'         => 1,
                'stock'          => 120,
                'how_to_use'     => "1. Dissolve 2 tablespoons of flour in 200ml of water or butter milk.\n2. Simmer on medium flame for 5-7 minutes until smooth porridge texture is formed.\n3. Add palm jaggery or sea salt as preferred.",
                'benefits'       => "• Fortifies spinal bone density & joint cartilage\n• Rich source of bio-available protein & iron\n• Ideal traditional vitality booster for women and elders\n• Promotes digestive wellness with dry ginger & cardamom",
                'ingredients'    => 'Sprouted Whole Black Gram (Ulundhu), Sprouted Finger Millet, Mappillai Samba Rice, Cardamom, Dry Ginger.',
                'tags'           => ['uluntham', 'black-gram', 'bone-strength', 'traditional', 'sprouted'],
                'images'         => [
                    '/assets/images/500g_Mangalam/1000330136.png',
                    '/assets/images/500g_Mangalam/Black Ulundhu Mix-11cm 13cm outline-01.jpg',
                    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '300g',
                        'size_number'    => 300,
                        'size_unit'      => 'g',
                        'variant_price'  => 120.00,
                        'variant_badge'  => 1,
                        'stock'          => 45,
                        'discount_type'  => 1,
                        'discount_value' => 20.00,
                        'images'         => ['/assets/images/500g_Mangalam/1000330136.png']
                    ],
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 180.00,
                        'variant_badge'  => 3, // Popular
                        'stock'          => 75,
                        'discount_type'  => 1,
                        'discount_value' => 40.00,
                        'images'         => ['/assets/images/500g_Mangalam/1000330136.png']
                    ]
                ]
            ],
            [
                'name'           => 'Sprouted Ragi & Multi-Millet Porridge Mix',
                'slug'           => 'sprouted-ragi-multi-millet-porridge-mix',
                'category_id'    => $catMillets->id,
                'category'       => $catMillets->name,
                'description'    => '100% soak-sprouted finger millet (ragi) combined with little millet, foxtail millet, and kodo millet. Slow stone-ground to retain 100% natural bran, calcium, and essential minerals.',
                'actual_price'   => 125.00,
                'discount_type'  => 1,
                'discount_value' => 25.00,
                'discount'       => '₹25 OFF',
                'status'         => 1,
                'stock'          => 95,
                'how_to_use'     => "Mix 2 tbsp with 200ml water/milk, cook for 4-5 mins. Sweeten with palm sugar or honey.",
                'benefits'       => "• 3x more calcium than unsprouted ragi\n• Naturally cooling & light on stomach\n• Perfect nutritious weaning food for kids & adults",
                'ingredients'    => 'Sprouted Finger Millet (Ragi), Foxtail Millet, Little Millet, Kodo Millet, Elaichi.',
                'tags'           => ['ragi', 'multi-millet', 'calcium-rich', 'kids-nutrition', 'easy-digest'],
                'images'         => [
                    '/assets/images/sprouted_millet_bowl.png',
                    '/assets/images/Multi-grains.jpg',
                    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '300g',
                        'size_number'    => 300,
                        'size_unit'      => 'g',
                        'variant_price'  => 75.00,
                        'variant_badge'  => 0,
                        'stock'          => 35,
                        'discount_type'  => 1,
                        'discount_value' => 15.00,
                        'images'         => ['/assets/images/sprouted_millet_bowl.png']
                    ],
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 125.00,
                        'variant_badge'  => 2,
                        'stock'          => 60,
                        'discount_type'  => 1,
                        'discount_value' => 25.00,
                        'images'         => ['/assets/images/sprouted_millet_bowl.png']
                    ]
                ]
            ],

            // ==========================================
            // CATEGORY 2: Heritage & Traditional Rice (3 Products)
            // ==========================================
            [
                'name'           => 'Heritage Mappillai Samba Red Rice',
                'slug'           => 'heritage-mappillai-samba-red-rice',
                'category_id'    => $catRice->id,
                'category'       => $catRice->name,
                'description'    => 'Ancient Tamil red rice known as "Bridegroom Rice". Famed for dramatically boosting physical stamina, endurance, and nerve health. Unpolished with whole outer bran intact.',
                'actual_price'   => 180.00,
                'discount_type'  => 1,
                'discount_value' => 30.00,
                'discount'       => '₹30 OFF',
                'status'         => 1,
                'stock'          => 80,
                'how_to_use'     => "Soak for 2-3 hours before cooking. Cook with 1:3 ratio of water in a clay pot or pressure cooker for 4-5 whistles.",
                'benefits'       => "• Boosts physical endurance & muscular strength\n• Abundant in natural zinc & bioavailable iron\n• Low glycemic index (GI) supports healthy blood sugar levels",
                'ingredients'    => '100% Single-Origin Unpolished Mappillai Samba Red Rice.',
                'tags'           => ['mappillai-samba', 'heritage-rice', 'stamina', 'unpolished', 'organic'],
                'images'         => [
                    'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=800&q=80',
                    '/assets/images/categories/rice.png',
                    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 95.00,
                        'variant_badge'  => 1,
                        'stock'          => 40,
                        'discount_type'  => 1,
                        'discount_value' => 15.00,
                        'images'         => ['https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=800&q=80']
                    ],
                    [
                        'size_key'       => '1000g',
                        'size_number'    => 1000,
                        'size_unit'      => 'g',
                        'variant_price'  => 180.00,
                        'variant_badge'  => 3,
                        'stock'          => 40,
                        'discount_type'  => 1,
                        'discount_value' => 30.00,
                        'images'         => ['https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=800&q=80']
                    ]
                ]
            ],
            [
                'name'           => 'Organic Karuppu Kavuni Black Rice',
                'slug'           => 'organic-karuppu-kavuni-black-rice',
                'category_id'    => $catRice->id,
                'category'       => $catRice->name,
                'description'    => 'Ancient royal heirloom black rice with intense anthocyanin antioxidant pigment. Provides rich nutty flavor and unmatched cellular protective properties.',
                'actual_price'   => 260.00,
                'discount_type'  => 1,
                'discount_value' => 40.00,
                'discount'       => '₹40 OFF',
                'status'         => 1,
                'stock'          => 65,
                'how_to_use'     => "Soak for 4 hours. Ideal for preparing traditional Kavuni Arisi sweet porridge, idli batter, or wholesome salads.",
                'benefits'       => "• Rich in anthocyanins & disease-fighting antioxidants\n• Supports cardiovascular health and liver detox\n• High dietary fiber aids weight management",
                'ingredients'    => '100% Pure Heirloom Karuppu Kavuni Black Rice.',
                'tags'           => ['karuppu-kavuni', 'black-rice', 'antioxidants', 'superfood', 'anti-aging'],
                'images'         => [
                    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 140.00,
                        'variant_badge'  => 1,
                        'stock'          => 35,
                        'discount_type'  => 1,
                        'discount_value' => 20.00,
                        'images'         => ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80']
                    ],
                    [
                        'size_key'       => '1000g',
                        'size_number'    => 1000,
                        'size_unit'      => 'g',
                        'variant_price'  => 260.00,
                        'variant_badge'  => 2,
                        'stock'          => 30,
                        'discount_type'  => 1,
                        'discount_value' => 40.00,
                        'images'         => ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80']
                    ]
                ]
            ],
            [
                'name'           => 'Poongar Traditional Rice for Women Wellness',
                'slug'           => 'poongar-traditional-rice-women-wellness',
                'category_id'    => $catRice->id,
                'category'       => $catRice->name,
                'description'    => 'Revered native red rice traditionally prescribed in Siddha & Ayurveda for hormonal harmony, postnatal recovery, and hemoglobin elevation.',
                'actual_price'   => 170.00,
                'discount_type'  => 1,
                'discount_value' => 20.00,
                'discount'       => '₹20 OFF',
                'status'         => 1,
                'stock'          => 70,
                'how_to_use'     => "Soak for 2 hours. Cook as table rice, soft kanji (porridge), or ferment overnight for probiotc Pazhaya Sadham.",
                'benefits'       => "• Balances hormones and restores postnatal strength\n• Rich in trace minerals, iron, magnesium and B-vitamins\n• Naturally boosts lactation and immunity",
                'ingredients'    => '100% Pure Unpolished Poongar Rice.',
                'tags'           => ['poongar', 'womens-health', 'traditional-rice', 'iron-rich', 'hormonal-balance'],
                'images'         => [
                    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 90.00,
                        'variant_badge'  => 0,
                        'stock'          => 35,
                        'discount_type'  => 1,
                        'discount_value' => 10.00,
                        'images'         => ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80']
                    ],
                    [
                        'size_key'       => '1000g',
                        'size_number'    => 1000,
                        'size_unit'      => 'g',
                        'variant_price'  => 170.00,
                        'variant_badge'  => 3,
                        'stock'          => 35,
                        'discount_type'  => 1,
                        'discount_value' => 20.00,
                        'images'         => ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80']
                    ]
                ]
            ],

            // ==========================================
            // CATEGORY 3: Cold Wood Pressed Oils (3 Products)
            // ==========================================
            [
                'name'           => 'Wood Pressed Sesame (Gingelly) Oil / Mara Chekku',
                'slug'           => 'wood-pressed-sesame-gingelly-oil-mara-chekku',
                'category_id'    => $catOils->id,
                'category'       => $catOils->name,
                'description'    => 'Authentic cold pressed sesame oil extracted in traditional Vaagai wood pestle with pure palm jaggery. Unrefined, chemical-free, and full of natural aroma.',
                'actual_price'   => 360.00,
                'discount_type'  => 1,
                'discount_value' => 50.00,
                'discount'       => '₹50 OFF',
                'status'         => 1,
                'stock'          => 90,
                'how_to_use'     => "Use for everyday cooking, tempering curries, idli podi pairing, or traditional oil pulling and body massage.",
                'benefits'       => "• Rich in natural sesamol & sesamolin antioxidants\n• Supports cardiovascular health & balanced blood pressure\n• Natural cooling agent for body and scalp",
                'ingredients'    => 'Native Black Sesame Seeds, Pure Palm Jaggery (Karupatti).',
                'tags'           => ['sesame-oil', 'wood-pressed', 'mara-chekku', 'cold-pressed', 'heart-healthy'],
                'images'         => [
                    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '500ml',
                        'size_number'    => 500,
                        'size_unit'      => 'ml',
                        'variant_price'  => 190.00,
                        'variant_badge'  => 1,
                        'stock'          => 45,
                        'discount_type'  => 1,
                        'discount_value' => 25.00,
                        'images'         => ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80']
                    ],
                    [
                        'size_key'       => '1000ml',
                        'size_number'    => 1000,
                        'size_unit'      => 'ml',
                        'variant_price'  => 360.00,
                        'variant_badge'  => 2,
                        'stock'          => 45,
                        'discount_type'  => 1,
                        'discount_value' => 50.00,
                        'images'         => ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80']
                    ]
                ]
            ],
            [
                'name'           => 'Cold Pressed Groundnut (Peanut) Oil / Kadalai Ennai',
                'slug'           => 'cold-pressed-groundnut-peanut-oil-kadalai-ennai',
                'category_id'    => $catOils->id,
                'category'       => $catOils->name,
                'description'    => 'Sun-dried farm-grown peanuts crushed slowly in wooden expellers without heating. Retains sweet peanut aroma, Vitamin E, and heart-friendly fats.',
                'actual_price'   => 310.00,
                'discount_type'  => 1,
                'discount_value' => 40.00,
                'discount'       => '₹40 OFF',
                'status'         => 1,
                'stock'          => 100,
                'how_to_use'     => "Ideal for deep frying, sautéing, and everyday South Indian curries with a high smoke point.",
                'benefits'       => "• Zero trans fats & zero cholesterol\n• High Vitamin E & plant sterols for heart protection\n• Non-sticky, light, and enhances food flavor naturally",
                'ingredients'    => '100% Native Sun-Dried Peanut Kernels.',
                'tags'           => ['groundnut-oil', 'wood-pressed', 'kadalai-ennai', 'chemical-free', 'traditional-cooking'],
                'images'         => [
                    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '500ml',
                        'size_number'    => 500,
                        'size_unit'      => 'ml',
                        'variant_price'  => 160.00,
                        'variant_badge'  => 0,
                        'stock'          => 50,
                        'discount_type'  => 1,
                        'discount_value' => 20.00,
                        'images'         => ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80']
                    ],
                    [
                        'size_key'       => '1000ml',
                        'size_number'    => 1000,
                        'size_unit'      => 'ml',
                        'variant_price'  => 310.00,
                        'variant_badge'  => 3,
                        'stock'          => 50,
                        'discount_type'  => 1,
                        'discount_value' => 40.00,
                        'images'         => ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80']
                    ]
                ]
            ],
            [
                'name'           => 'Pure Cold Pressed Extra Virgin Coconut Oil',
                'slug'           => 'pure-cold-pressed-extra-virgin-coconut-oil',
                'category_id'    => $catOils->id,
                'category'       => $catOils->name,
                'description'    => 'Extracted from fresh, organically cultivated coconut milk/copra without chemical refining, bleaching, or deodorizing. Rich tropical aroma and silky texture.',
                'actual_price'   => 460.00,
                'discount_type'  => 1,
                'discount_value' => 60.00,
                'discount'       => '₹60 OFF',
                'status'         => 1,
                'stock'          => 85,
                'how_to_use'     => "Use for authentic Kerala/Tamil cooking, morning bullet coffee, hair nourishing oil, or baby skin care.",
                'benefits'       => "• Rich in Lauric Acid and Medium Chain Triglycerides (MCTs)\n• Accelerates metabolism & supports gut flora\n• Purest nourishment for healthy hair follicles and glowing skin",
                'ingredients'    => '100% Organic Fresh Coconut Copra.',
                'tags'           => ['coconut-oil', 'extra-virgin', 'mct', 'skin-hair-care', 'cold-pressed'],
                'images'         => [
                    'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '500ml',
                        'size_number'    => 500,
                        'size_unit'      => 'ml',
                        'variant_price'  => 240.00,
                        'variant_badge'  => 1,
                        'stock'          => 45,
                        'discount_type'  => 1,
                        'discount_value' => 30.00,
                        'images'         => ['https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80']
                    ],
                    [
                        'size_key'       => '1000ml',
                        'size_number'    => 1000,
                        'size_unit'      => 'ml',
                        'variant_price'  => 460.00,
                        'variant_badge'  => 2,
                        'stock'          => 40,
                        'discount_type'  => 1,
                        'discount_value' => 60.00,
                        'images'         => ['https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80']
                    ]
                ]
            ],

            // ==========================================
            // CATEGORY 4: Organic Sweeteners & Natural Foods (3 Products)
            // ==========================================
            [
                'name'           => 'Pure Traditional Palm Jaggery (Sillu Karupatti)',
                'slug'           => 'pure-traditional-palm-jaggery-sillu-karupatti',
                'category_id'    => $catSweeteners->id,
                'category'       => $catSweeteners->name,
                'description'    => 'Authentic unrefined palm jaggery boiled from fresh sweet toddy (Pathani/Neera) sap. Packed with natural plant iron, potassium, and minerals with a rich earthy sweetness.',
                'actual_price'   => 330.00,
                'discount_type'  => 1,
                'discount_value' => 40.00,
                'discount'       => '₹40 OFF',
                'status'         => 1,
                'stock'          => 75,
                'how_to_use'     => "Add directly to Sukku malli coffee, herbal teas, health mix porridges, or traditional payasam.",
                'benefits'       => "• Rich plant-based iron source for fighting anemia\n• Soothes throat irritation, dry cough & cold symptoms\n• Purifies blood and aids digestive secretion",
                'ingredients'    => '100% Pure Organic Palm Tree Sap (Neera extract).',
                'tags'           => ['karupatti', 'palm-jaggery', 'iron-rich', 'unrefined-sugar', 'natural-sweetener'],
                'images'         => [
                    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 175.00,
                        'variant_badge'  => 1,
                        'stock'          => 35,
                        'discount_type'  => 1,
                        'discount_value' => 20.00,
                        'images'         => ['https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80']
                    ],
                    [
                        'size_key'       => '1000g',
                        'size_number'    => 1000,
                        'size_unit'      => 'g',
                        'variant_price'  => 330.00,
                        'variant_badge'  => 3,
                        'stock'          => 40,
                        'discount_type'  => 1,
                        'discount_value' => 40.00,
                        'images'         => ['https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80']
                    ]
                ]
            ],
            [
                'name'           => 'Wild Forest Raw Organic Honey',
                'slug'           => 'wild-forest-raw-organic-honey',
                'category_id'    => $catSweeteners->id,
                'category'       => $catSweeteners->name,
                'description'    => 'Ethically harvested from wild beehives in the pristine Western Ghats forests. 100% raw, unheated, and unpasteurized to preserve active bee enzymes, pollen, and propolis.',
                'actual_price'   => 350.00,
                'discount_type'  => 1,
                'discount_value' => 50.00,
                'discount'       => '₹50 OFF',
                'status'         => 1,
                'stock'          => 60,
                'how_to_use'     => "Take 1 spoonful with lukewarm water and lemon in the morning, or drizzle over fruits and porridges.",
                'benefits'       => "• Potent natural antibacterial & anti-inflammatory qualities\n• Relieves seasonal allergies, sore throat, and cough\n• Boosts daily metabolic energy and gut microbiome",
                'ingredients'    => '100% Pure Unfiltered Wild Forest Honey.',
                'tags'           => ['raw-honey', 'wild-honey', 'organic', 'immunity', 'pure-sweetener'],
                'images'         => [
                    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '250g',
                        'size_number'    => 250,
                        'size_unit'      => 'g',
                        'variant_price'  => 190.00,
                        'variant_badge'  => 0,
                        'stock'          => 25,
                        'discount_type'  => 1,
                        'discount_value' => 20.00,
                        'images'         => ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80']
                    ],
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 350.00,
                        'variant_badge'  => 1,
                        'stock'          => 35,
                        'discount_type'  => 1,
                        'discount_value' => 50.00,
                        'images'         => ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80']
                    ]
                ]
            ],
            [
                'name'           => 'Traditional Country Sugar (Nattu Sakkarai)',
                'slug'           => 'traditional-country-sugar-nattu-sakkarai',
                'category_id'    => $catSweeteners->id,
                'category'       => $catSweeteners->name,
                'description'    => 'Artisanal sulfur-free brown cane sugar made through traditional boiling of organically farmed sugarcane juice. Unbleached, retaining molasses and rich minerals.',
                'actual_price'   => 130.00,
                'discount_type'  => 1,
                'discount_value' => 20.00,
                'discount'       => '₹20 OFF',
                'status'         => 1,
                'stock'          => 110,
                'how_to_use'     => "Direct 1:1 healthy alternative to white refined sugar for tea, coffee, baking, and sweets.",
                'benefits'       => "• 100% Free from sulfur, bone-char, and bleaching agents\n• Rich in calcium, magnesium, and natural cane molasses\n• Gentle on teeth and prevents refined sugar crashes",
                'ingredients'    => '100% Pure Organically Cultivated Sugarcane Juice.',
                'tags'           => ['nattu-sakkarai', 'country-sugar', 'chemical-free', 'cane-sugar', 'daily-sweetener'],
                'images'         => [
                    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80'
                ],
                'package_sizes'  => [
                    [
                        'size_key'       => '500g',
                        'size_number'    => 500,
                        'size_unit'      => 'g',
                        'variant_price'  => 70.00,
                        'variant_badge'  => 0,
                        'stock'          => 50,
                        'discount_type'  => 1,
                        'discount_value' => 10.00,
                        'images'         => ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80']
                    ],
                    [
                        'size_key'       => '1000g',
                        'size_number'    => 1000,
                        'size_unit'      => 'g',
                        'variant_price'  => 130.00,
                        'variant_badge'  => 2,
                        'stock'          => 60,
                        'discount_type'  => 1,
                        'discount_value' => 20.00,
                        'images'         => ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80']
                    ]
                ]
            ],
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
