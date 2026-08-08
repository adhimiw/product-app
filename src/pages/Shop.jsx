import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

const PRODUCTS = [
    {
        id: 'amutham-300g',
        name: 'Amutham Sprouted Health Mix (300g)',
        category: 'Sprouted Millets & Grains',
        subtitle: '100% Natural | 300g Pouch',
        description: 'Our signature sprouted ancient grain porridge mix in a 300g daily pack. Prepared with traditional methods rich in protein, iron, and fiber.',
        price: 110,
        inrPrice: '₹110',
        image: '/assets/images/300g_amutham/1000330151.jpg.jpeg',
        images: [
            '/assets/images/300g_amutham/amutham-01.jpg',
            '/assets/images/300g_amutham/1000330151.jpg.jpeg',
            '/assets/images/300g_amutham/amutham-02.jpg',
            '/assets/images/300g_amutham/Picsart_26-08-06_11-44-10-447.jpg.jpeg',
            '/assets/images/300g_amutham/Picsart_26-08-06_12-10-06-119.jpg.jpeg'
        ],
        badge: 'Popular 300g',
        badgeType: 'green',
        tag: 'Amutham',
        rating: 4.9,
        reviewCount: 1240,
        weights: ['300g', '500g'],
        gramOptions: [
            { size: '300g Package', price: 110, inrPrice: '₹110', badge: 'Popular' },
            { size: '500g Package', price: 160, inrPrice: '₹160', badge: 'Best Value' }
        ],
        features: [
            { icon: '🌱', text: '100% Soak-Sprouted' },
            { icon: '🌾', text: '0% Chemicals & Preservatives' },
            { icon: '⚡', text: 'Rich in Protein & Fiber' },
            { icon: '🍵', text: 'Our Traditional Taste' }
        ],
        tags: ['Digestion', 'Immunity', 'Energy', 'Vitality'],
        howToUse: {
            english: "Dissolve 2 tablespoons of Amutham Sprouted Health Mix in 200ml of clean water without lumps. Boil on medium heat for 5-6 minutes. Add brown sugar (naattu sarkarai) or salt as required. Tastes even better when mixed with boiled milk.",
            tamil: "200ml தண்ணீரில் 2 ஸ்பூன் மாவை கட்டியில்லாமல் கரைத்து பின் கொதிக்க வைக்கவும். 5-6 நிமிடம் நன்றாக கொதித்த பின் நாட்டுச்சர்க்கரை அல்லது உப்பு சேர்க்கவும். பாலுடன் சேர்த்து சாப்பிடும் போது மேலும் சுவையாக இருக்கும்."
        },
        benefitsList: [
            "Greengram: Rich in Vitamin C and antioxidants that boost immunity and repair cells.",
            "Kambu (Pearl Millet): Natural source of iron that prevents anemia and keeps body cool.",
            "Ragi (Finger Millet): Unlocks iron, B12, and calcium for strong bones.",
            "Solam & Kondakadalai: Rich in fiber, zinc, and protein for sustained daily energy."
        ],
        ingredientsList: "Sprouted Greengram, Sprouted Blackgram, Sprouted Kambu (Pearl Millet), Sprouted Ragi (Finger Millet), Sprouted Solam (Sorghum), Sprouted Kondakadalai (Chickpeas), Varukadalai (Groundnut), Natural Green Cardamom."
    },
    {
        id: 'amutham-500g',
        name: 'Amutham Sprouted Health Mix (500g)',
        category: 'Sprouted Millets & Grains',
        subtitle: '100% Natural | 500g Value Pack',
        description: 'Our signature sprouted ancient grain porridge mix in a 500g value pouch. High nutrient bioavailability with zero preservatives.',
        price: 160,
        inrPrice: '₹160',
        image: '/assets/images/500g_Amutham/1000330151.jpg.jpeg',
        images: [
            '/assets/images/500g_Amutham/1000330151.jpg.jpeg',
            '/assets/images/500g_Amutham/11cm 13cm outline-01.jpg',
            '/assets/images/500g_Amutham/11cm 13cm outline-02.jpg',
            '/assets/images/500g_Amutham/Picsart_26-08-06_11-44-10-447.jpg.jpeg',
            '/assets/images/500g_Amutham/Picsart_26-08-06_12-10-06-119.jpg.jpeg'
        ],
        badge: 'Best Value 500g',
        badgeType: 'green',
        tag: 'Amutham',
        rating: 4.95,
        reviewCount: 1820,
        weights: ['300g', '500g'],
        gramOptions: [
            { size: '500g Package', price: 160, inrPrice: '₹160', badge: 'Best Value' },
            { size: '300g Package', price: 110, inrPrice: '₹110', badge: 'Popular' }
        ],
        features: [
            { icon: '🌱', text: '100% Soak-Sprouted' },
            { icon: '🌾', text: '0% Chemicals & Preservatives' },
            { icon: '⚡', text: '500g Family Value' },
            { icon: '🍵', text: 'Our Traditional Taste' }
        ],
        tags: ['Digestion', 'Immunity', 'Family Energy', 'Vitality'],
        howToUse: {
            english: "Dissolve 2 tablespoons of Amutham Sprouted Health Mix in 200ml of clean water without lumps. Boil on medium heat for 5-6 minutes. Add brown sugar (naattu sarkarai) or salt as required. Tastes even better when mixed with boiled milk.",
            tamil: "200ml தண்ணீரில் 2 ஸ்பூன் மாவை கட்டியில்லாமல் கரைத்து பின் கொதிக்க வைக்கவும். 5-6 நிமிடம் நன்றாக கொதித்த பின் நாட்டுச்சர்க்கரை அல்லது உப்பு சேர்க்கவும். பாலுடன் சேர்த்து சாப்பிடும் போது மேலும் சுவையாக இருக்கும்."
        },
        benefitsList: [
            "Greengram: Rich in Vitamin C and antioxidants that boost immunity and repair cells.",
            "Kambu (Pearl Millet): Natural source of iron that prevents anemia and keeps body cool.",
            "Ragi (Finger Millet): Unlocks iron, B12, and calcium for strong bones.",
            "Solam & Kondakadalai: Rich in fiber, zinc, and protein for sustained daily energy."
        ],
        ingredientsList: "Sprouted Greengram, Sprouted Blackgram, Sprouted Kambu (Pearl Millet), Sprouted Ragi (Finger Millet), Sprouted Solam (Sorghum), Sprouted Kondakadalai (Chickpeas), Varukadalai (Groundnut), Natural Green Cardamom."
    },
    {
        id: 'mangalam-300g',
        name: 'Mangalam Uluntham Mix (300g)',
        category: 'Heritage Mappillai Samba Blend',
        subtitle: 'Mappillai Samba Rice | 300g Pouch',
        description: 'Crafted with sprouted blackgram and traditional Mappillai Samba rice. High in bio-calcium & iron for bone strength and stamina.',
        price: 115,
        inrPrice: '₹115',
        image: '/assets/images/300g_mangalam/1000330136.png',
        images: [
            '/assets/images/300g_mangalam/1000330136.png',
            '/assets/images/300g_mangalam/Black Ulundhu Mix-10cm 12cm outline-01.jpg',
            '/assets/images/300g_mangalam/Black Ulundhu Mix-10cm 12cm outline-02.jpg',
            '/assets/images/300g_mangalam/Picsart_26-08-06_11-10-42-477.jpg.jpeg',
            '/assets/images/300g_mangalam/Picsart_26-08-06_11-32-37-682.jpg.jpeg'
        ],
        badge: 'Heritage 300g',
        badgeType: 'orange',
        tag: 'Mangalam',
        rating: 4.92,
        reviewCount: 650,
        weights: ['300g', '500g'],
        gramOptions: [
            { size: '300g Package', price: 115, inrPrice: '₹115', badge: 'Standard' },
            { size: '500g Package', price: 180, inrPrice: '₹180', badge: 'Popular' }
        ],
        features: [
            { icon: '🌾', text: 'Mappillai Samba Rice' },
            { icon: '🦴', text: 'Bone & Muscle Strength' },
            { icon: '💪', text: 'High Bio-Calcium & Iron' },
            { icon: '🇮🇳', text: "Your Health is Nation's Priority" }
        ],
        tags: ['Bone Strength', 'Stamina', 'Ayurveda Energy', 'Nervous System'],
        howToUse: {
            english: "Mix 2 tablespoons of Mangalam Uluntham Mix in water or milk, simmer for 5-6 minutes stirring gently until smooth porridge texture. Add palm jaggery or milk as desired.",
            tamil: "பாலில் அல்லது தண்ணீரில் மாவை கரைத்து நன்றாக கொதிக்க வைத்து பனைவெல்லம் அல்லது சர்க்கரை சேர்த்து அருந்தவும்."
        },
        benefitsList: [
            "Sprouted Blackgram: Gentle on digestion, high fiber, strengthens bones and muscles.",
            "Mappillai Samba Rice: Ancient Tamil rice variety renowned for boosting stamina and blood circulation."
        ],
        ingredientsList: "Sprouted Blackgram (Ulundhu), Traditional Mappillai Samba Rice, Sprouted Cardamom, Dry Ginger."
    },
    {
        id: 'mangalam-500g',
        name: 'Mangalam Uluntham Mix (500g)',
        category: 'Heritage Mappillai Samba Blend',
        subtitle: 'Mappillai Samba Rice | 500g Value Pack',
        description: 'Crafted with sprouted blackgram and traditional Mappillai Samba rice in a 500g value pouch. Optimal stamina and bone density support.',
        price: 180,
        inrPrice: '₹180',
        image: '/assets/images/500g_Mangalam/1000330136.png',
        images: [
            '/assets/images/500g_Mangalam/1000330136.png',
            '/assets/images/500g_Mangalam/Black Ulundhu Mix-11cm 13cm outline-01.jpg',
            '/assets/images/500g_Mangalam/Black Ulundhu Mix-11cm 13cm outline-02.jpg',
            '/assets/images/500g_Mangalam/Picsart_26-08-06_11-56-39-999.jpg.jpeg',
            '/assets/images/500g_Mangalam/Picsart_26-08-06_12-17-35-692.jpg.jpeg'
        ],
        badge: 'Popular 500g',
        badgeType: 'orange',
        tag: 'Mangalam',
        rating: 4.96,
        reviewCount: 940,
        weights: ['500g', '300g'],
        gramOptions: [
            { size: '500g Package', price: 180, inrPrice: '₹180', badge: 'Popular' },
            { size: '300g Package', price: 115, inrPrice: '₹115', badge: 'Standard' }
        ],
        features: [
            { icon: '🌾', text: 'Mappillai Samba Rice' },
            { icon: '🦴', text: 'Bone & Muscle Strength' },
            { icon: '💪', text: '500g Value Pack' },
            { icon: '🇮🇳', text: "Your Health is Nation's Priority" }
        ],
        tags: ['Bone Strength', 'Stamina', 'Ayurveda Energy', 'Nervous System'],
        howToUse: {
            english: "Mix 2 tablespoons of Mangalam Uluntham Mix in water or milk, simmer for 5-6 minutes stirring gently until smooth porridge texture. Add palm jaggery or milk as desired.",
            tamil: "பாலில் அல்லது தண்ணீரில் மாவை கரைத்து நன்றாக கொதிக்க வைத்து பனைவெல்லம் அல்லது சர்க்கரை சேர்த்து அருந்தவும்."
        },
        benefitsList: [
            "Sprouted Blackgram: Gentle on digestion, high fiber, strengthens bones and muscles.",
            "Mappillai Samba Rice: Ancient Tamil rice variety renowned for boosting stamina and blood circulation."
        ],
        ingredientsList: "Sprouted Blackgram (Ulundhu), Traditional Mappillai Samba Rice, Sprouted Cardamom, Dry Ginger."
    }
];

export default function Shop({ onProductView, onAddToCart }) {
    const { t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredProducts = selectedCategory === 'All'
        ? PRODUCTS
        : PRODUCTS.filter(p => p.tag === selectedCategory);

    return (
        <main className="shop-page">
            <div className="container">

                {/* Shop Header */}
                <div className="shop-header-wrapper">
                    <span className="section-subtitle">{t('productSectionSub')}</span>
                    <h1 className="shop-page-title">{t('productSectionTitle')}</h1>
                    <p className="shop-page-desc">
                        {t('productSectionDesc')}
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="shop-filter-bar">
                    <div className="shop-categories">
                        <button
                            className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('All')}
                        >
                            {t('filterAll')}
                        </button>
                        <button
                            className={`filter-chip ${selectedCategory === 'Amutham' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('Amutham')}
                        >
                            {t('filterAmutham')}
                        </button>
                        <button
                            className={`filter-chip ${selectedCategory === 'Mangalam' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('Mangalam')}
                        >
                            {t('filterMangalam')}
                        </button>
                    </div>
                    <div className="shop-item-count">
                        Showing {filteredProducts.length} items
                    </div>
                </div>

                {/* Products Grid - 4 Column Layout */}
                <div className="shop-grid-4col">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            {...product}
                            onProductView={onProductView}
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </div>

            </div>
        </main>
    );
}
export { PRODUCTS };

