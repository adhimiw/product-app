import React from 'react';

export default function OrganicBackgroundOverlay() {
    return (
        <div className="organic-bg-theme-overlay grains-millets-bg-theme" aria-hidden="true">
            {/* SVG Gradients for Natural Grain Husks */}
            <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
                <defs>
                    {/* Golden Ripe Rice Husk Gradient */}
                    <linearGradient id="riceGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.22" />
                        <stop offset="50%" stopColor="#c5a059" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#a37e2c" stopOpacity="0.12" />
                    </linearGradient>

                    {/* Warm Millet Amber Gradient */}
                    <linearGradient id="milletAmberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#cda34f" stopOpacity="0.20" />
                        <stop offset="100%" stopColor="#966d24" stopOpacity="0.14" />
                    </linearGradient>

                    {/* Paddy Stem Natural Earthy Green */}
                    <linearGradient id="grainStemGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#3d6342" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#8ca86e" stopOpacity="0.12" />
                    </linearGradient>

                    {/* Reusable Rice Grain Shape */}
                    <g id="paddy-rice-grain">
                        <path d="M 0 -11 C 5 -6 5 6 0 11 C -5 6 -5 -6 0 -11 Z" fill="url(#riceGoldGradient)" stroke="rgba(163, 126, 44, 0.25)" strokeWidth="0.8" />
                        {/* Longitudinal husk crease */}
                        <line x1="0" y1="-8" x2="0" y2="8" stroke="rgba(163, 126, 44, 0.2)" strokeWidth="0.6" />
                        {/* Slender awn / bristle */}
                        <line x1="0" y1="-11" x2="1" y2="-17" stroke="rgba(163, 126, 44, 0.2)" strokeWidth="0.6" strokeLinecap="round" />
                    </g>

                    {/* Reusable Pearl Millet Bead */}
                    <g id="millet-pearl-grain">
                        <circle cx="0" cy="0" r="4.5" fill="url(#milletAmberGradient)" stroke="rgba(150, 109, 36, 0.25)" strokeWidth="0.7" />
                        <circle cx="-1.2" cy="-1.2" r="1.5" fill="#ffffff" opacity="0.3" />
                    </g>
                </defs>
            </svg>

            {/* ==========================================================================
                1. TOP-LEFT: Arching Traditional Paddy Rice Sheaf (நெற்கதிர்)
                ========================================================================== */}
            <svg className="bg-grain-watermark left top rice-sheaf-svg" viewBox="0 0 380 580" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Main Arching Rice Stem (Rachis) */}
                <path d="M -30 580 C 40 430 90 290 105 160 C 115 80 160 30 210 10" stroke="url(#grainStemGradient)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 105 160 C 120 90 175 45 235 25" stroke="url(#grainStemGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

                {/* Secondary Arching Stalk */}
                <path d="M -40 520 C 30 400 70 270 80 180 C 90 110 130 70 175 50" stroke="url(#grainStemGradient)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />

                {/* Primary Drooping Panicles & Rice Grains */}
                {/* Cluster Top Panicle 1 */}
                <path d="M 210 10 C 235 5 260 20 275 45" stroke="url(#grainStemGradient)" strokeWidth="1.2" strokeLinecap="round" />
                <use href="#paddy-rice-grain" x="225" y="12" transform="rotate(50, 225, 12) scale(0.9)" />
                <use href="#paddy-rice-grain" x="248" y="24" transform="rotate(65, 248, 24) scale(0.9)" />
                <use href="#paddy-rice-grain" x="268" y="42" transform="rotate(80, 268, 42) scale(0.85)" />

                {/* Top Panicle 2 */}
                <path d="M 195 25 C 230 35 265 65 285 100" stroke="url(#grainStemGradient)" strokeWidth="1.2" strokeLinecap="round" />
                <use href="#paddy-rice-grain" x="215" y="36" transform="rotate(45, 215, 36)" />
                <use href="#paddy-rice-grain" x="242" y="55" transform="rotate(60, 242, 55)" />
                <use href="#paddy-rice-grain" x="265" y="80" transform="rotate(75, 265, 80) scale(0.95)" />
                <use href="#paddy-rice-grain" x="282" y="108" transform="rotate(85, 282, 108) scale(0.85)" />

                {/* Mid Panicle 3 */}
                <path d="M 160 85 C 210 100 255 140 280 185" stroke="url(#grainStemGradient)" strokeWidth="1.2" strokeLinecap="round" />
                <use href="#paddy-rice-grain" x="180" y="98" transform="rotate(40, 180, 98)" />
                <use href="#paddy-rice-grain" x="210" y="118" transform="rotate(55, 210, 118)" />
                <use href="#paddy-rice-grain" x="240" y="145" transform="rotate(70, 240, 145)" />
                <use href="#paddy-rice-grain" x="268" y="178" transform="rotate(85, 268, 178) scale(0.9)" />

                {/* Mid Panicle 4 */}
                <path d="M 125 150 C 180 170 230 215 255 265" stroke="url(#grainStemGradient)" strokeWidth="1.2" strokeLinecap="round" />
                <use href="#paddy-rice-grain" x="145" y="165" transform="rotate(35, 145, 165)" />
                <use href="#paddy-rice-grain" x="178" y="188" transform="rotate(50, 178, 188)" />
                <use href="#paddy-rice-grain" x="212" y="218" transform="rotate(65, 212, 218)" />
                <use href="#paddy-rice-grain" x="242" y="255" transform="rotate(80, 242, 255)" />

                {/* Lower Panicle 5 */}
                <path d="M 105 230 C 160 250 210 300 235 355" stroke="url(#grainStemGradient)" strokeWidth="1.2" strokeLinecap="round" />
                <use href="#paddy-rice-grain" x="125" y="245" transform="rotate(35, 125, 245)" />
                <use href="#paddy-rice-grain" x="158" y="270" transform="rotate(50, 158, 270)" />
                <use href="#paddy-rice-grain" x="190" y="302" transform="rotate(65, 190, 302)" />
                <use href="#paddy-rice-grain" x="222" y="342" transform="rotate(80, 222, 342)" />

                {/* Bottom Panicle 6 */}
                <path d="M 85 330 C 135 355 180 405 205 460" stroke="url(#grainStemGradient)" strokeWidth="1.2" strokeLinecap="round" />
                <use href="#paddy-rice-grain" x="105" y="348" transform="rotate(35, 105, 348)" />
                <use href="#paddy-rice-grain" x="135" y="375" transform="rotate(50, 135, 375)" />
                <use href="#paddy-rice-grain" x="168" y="412" transform="rotate(65, 168, 412)" />
                <use href="#paddy-rice-grain" x="195" y="452" transform="rotate(80, 195, 452)" />
            </svg>

            {/* ==========================================================================
                2. TOP-RIGHT: Foxtail Millet & Pearl Millet Spikes (தினை / கம்பு கதிர்)
                ========================================================================== */}
            <svg className="bg-grain-watermark right top millet-sheaf-svg" viewBox="0 0 380 580" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Main Millet Stalk */}
                <path d="M 400 580 C 330 420 280 270 270 140 C 265 75 220 25 170 10" stroke="url(#grainStemGradient)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 270 140 C 255 75 200 35 145 15" stroke="url(#grainStemGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

                {/* Dense Pearl Millet Head 1 (Top Arch) */}
                <path d="M 170 10 C 140 20 115 45 100 80" stroke="url(#milletAmberGradient)" strokeWidth="7" strokeLinecap="round" opacity="0.4" />
                {/* Millet Seed Clusters along Head */}
                <use href="#millet-pearl-grain" x="165" y="12" />
                <use href="#millet-pearl-grain" x="155" y="16" />
                <use href="#millet-pearl-grain" x="145" y="24" />
                <use href="#millet-pearl-grain" x="135" y="32" />
                <use href="#millet-pearl-grain" x="125" y="44" />
                <use href="#millet-pearl-grain" x="115" y="58" />
                <use href="#millet-pearl-grain" x="105" y="74" />
                <use href="#millet-pearl-grain" x="98" y="92" />
                {/* Fine Millet Bristles / Setae radiating outwards */}
                <line x1="165" y1="12" x2="175" y2="4" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />
                <line x1="155" y1="16" x2="162" y2="6" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />
                <line x1="145" y1="24" x2="150" y2="12" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />
                <line x1="135" y1="32" x2="138" y2="18" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />
                <line x1="125" y1="44" x2="124" y2="28" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />
                <line x1="115" y1="58" x2="110" y2="42" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />
                <line x1="105" y1="74" x2="95" y2="60" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />

                {/* Secondary Millet Head (Mid Stalk Branch) */}
                <path d="M 270 140 C 230 160 190 200 170 250" stroke="url(#grainStemGradient)" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 190 200 C 175 225 165 255 160 290" stroke="url(#milletAmberGradient)" strokeWidth="6.5" strokeLinecap="round" opacity="0.35" />
                <use href="#millet-pearl-grain" x="185" y="210" />
                <use href="#millet-pearl-grain" x="178" y="225" />
                <use href="#millet-pearl-grain" x="172" y="242" />
                <use href="#millet-pearl-grain" x="168" y="260" />
                <use href="#millet-pearl-grain" x="164" y="278" />
                <use href="#millet-pearl-grain" x="160" y="298" />

                {/* Lower Millet Side Branch */}
                <path d="M 290 280 C 240 310 200 360 180 420" stroke="url(#grainStemGradient)" strokeWidth="1.5" strokeLinecap="round" />
                <use href="#millet-pearl-grain" x="235" y="325" />
                <use href="#millet-pearl-grain" x="215" y="348" />
                <use href="#millet-pearl-grain" x="198" y="375" />
                <use href="#millet-pearl-grain" x="185" y="408" />

                {/* Whispering Awn Lines */}
                <line x1="185" y1="210" x2="198" y2="198" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />
                <line x1="178" y1="225" x2="192" y2="215" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />
                <line x1="172" y1="242" x2="186" y2="232" stroke="rgba(163, 126, 44, 0.3)" strokeWidth="0.8" />
            </svg>

            {/* ==========================================================================
                3. BOTTOM-LEFT: Ragi / Finger Millet (கேழ்வரகு) & Sprouted Paddy Base
                ========================================================================== */}
            <svg className="bg-grain-watermark left bottom ragi-sheaf-svg" viewBox="0 0 380 580" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Upward Reaching Stalk */}
                <path d="M -30 0 C 40 140 85 280 95 400 C 100 460 140 510 185 540" stroke="url(#grainStemGradient)" strokeWidth="2.2" strokeLinecap="round" />

                {/* Traditional Finger Millet (Ragi - Hand of 3-4 Spikes) */}
                {/* Finger 1 */}
                <path d="M 95 400 C 130 385 170 380 205 390" stroke="url(#grainStemGradient)" strokeWidth="1.3" strokeLinecap="round" />
                <use href="#millet-pearl-grain" x="120" y="390" transform="scale(0.85)" />
                <use href="#millet-pearl-grain" x="145" y="386" transform="scale(0.85)" />
                <use href="#millet-pearl-grain" x="172" y="385" transform="scale(0.85)" />
                <use href="#millet-pearl-grain" x="198" y="388" transform="scale(0.8)" />

                {/* Finger 2 */}
                <path d="M 95 400 C 135 405 175 420 210 445" stroke="url(#grainStemGradient)" strokeWidth="1.3" strokeLinecap="round" />
                <use href="#millet-pearl-grain" x="125" y="408" transform="scale(0.85)" />
                <use href="#millet-pearl-grain" x="152" y="420" transform="scale(0.85)" />
                <use href="#millet-pearl-grain" x="180" y="435" transform="scale(0.85)" />
                <use href="#millet-pearl-grain" x="205" y="450" transform="scale(0.8)" />

                {/* Finger 3 */}
                <path d="M 95 400 C 125 430 155 470 175 515" stroke="url(#grainStemGradient)" strokeWidth="1.3" strokeLinecap="round" />
                <use href="#millet-pearl-grain" x="115" y="432" transform="scale(0.85)" />
                <use href="#millet-pearl-grain" x="138" y="462" transform="scale(0.85)" />
                <use href="#millet-pearl-grain" x="160" y="495" transform="scale(0.8)" />

                {/* Secondary Paddy Grains Cluster */}
                <use href="#paddy-rice-grain" x="135" y="240" transform="rotate(45, 135, 240) scale(0.9)" />
                <use href="#paddy-rice-grain" x="162" y="265" transform="rotate(60, 162, 265) scale(0.9)" />
                <use href="#paddy-rice-grain" x="188" y="295" transform="rotate(75, 188, 295) scale(0.85)" />
            </svg>

            {/* ==========================================================================
                4. BOTTOM-RIGHT: Traditional Heirloom Paddy & Millet Sheaf
                ========================================================================== */}
            <svg className="bg-grain-watermark right bottom harvest-sheaf-svg" viewBox="0 0 380 580" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 410 0 C 330 150 280 300 270 430 C 265 490 220 540 170 560" stroke="url(#grainStemGradient)" strokeWidth="2.4" strokeLinecap="round" />

                {/* Drooping Paddy Rice Panicle */}
                <path d="M 270 430 C 225 415 180 430 145 465" stroke="url(#grainStemGradient)" strokeWidth="1.3" strokeLinecap="round" />
                <use href="#paddy-rice-grain" x="245" y="420" transform="rotate(-30, 245, 420)" />
                <use href="#paddy-rice-grain" x="215" y="425" transform="rotate(-45, 215, 425)" />
                <use href="#paddy-rice-grain" x="185" y="440" transform="rotate(-60, 185, 440)" />
                <use href="#paddy-rice-grain" x="155" y="465" transform="rotate(-75, 155, 465) scale(0.9)" />

                {/* Mid Stalk Rice Grains */}
                <use href="#paddy-rice-grain" x="235" y="290" transform="rotate(-35, 235, 290) scale(0.95)" />
                <use href="#paddy-rice-grain" x="205" y="315" transform="rotate(-50, 205, 315) scale(0.9)" />
                <use href="#paddy-rice-grain" x="175" y="348" transform="rotate(-65, 175, 348) scale(0.85)" />
            </svg>

            {/* ==========================================================================
                5. FLOATING HEIRLOOM GRAIN SEEDS (AUTHENTIC RICE & MILLET WATERMARKS)
                No emojis, no leaves, no flowers: pure grains and seeds drifting in breeze
                ========================================================================== */}
            {/* Heirloom Rice Grains */}
            <div className="floating-grain grain-seed-1">
                <svg viewBox="0 0 24 38" width="18" height="28" fill="none">
                    <path d="M 12 2 C 18 10 18 28 12 36 C 6 28 6 10 12 2 Z" fill="#c5a059" opacity="0.22" />
                    <line x1="12" y1="6" x2="12" y2="32" stroke="#8c6b2d" strokeWidth="0.8" opacity="0.3" />
                </svg>
            </div>

            <div className="floating-grain grain-seed-2">
                <svg viewBox="0 0 24 38" width="22" height="34" fill="none">
                    <path d="M 12 2 C 18 10 18 28 12 36 C 6 28 6 10 12 2 Z" fill="#d4af37" opacity="0.20" />
                    <line x1="12" y1="6" x2="12" y2="32" stroke="#8c6b2d" strokeWidth="0.8" opacity="0.3" />
                </svg>
            </div>

            <div className="floating-grain grain-seed-3">
                <svg viewBox="0 0 24 38" width="16" height="26" fill="none">
                    <path d="M 12 2 C 18 10 18 28 12 36 C 6 28 6 10 12 2 Z" fill="#c5a059" opacity="0.24" />
                    <line x1="12" y1="6" x2="12" y2="32" stroke="#8c6b2d" strokeWidth="0.8" opacity="0.3" />
                </svg>
            </div>

            <div className="floating-grain grain-seed-4">
                <svg viewBox="0 0 24 38" width="20" height="32" fill="none">
                    <path d="M 12 2 C 18 10 18 28 12 36 C 6 28 6 10 12 2 Z" fill="#b38a42" opacity="0.19" />
                    <line x1="12" y1="6" x2="12" y2="32" stroke="#8c6b2d" strokeWidth="0.8" opacity="0.3" />
                </svg>
            </div>

            <div className="floating-grain grain-seed-5">
                <svg viewBox="0 0 24 38" width="17" height="27" fill="none">
                    <path d="M 12 2 C 18 10 18 28 12 36 C 6 28 6 10 12 2 Z" fill="#d4af37" opacity="0.22" />
                    <line x1="12" y1="6" x2="12" y2="32" stroke="#8c6b2d" strokeWidth="0.8" opacity="0.3" />
                </svg>
            </div>

            <div className="floating-grain grain-seed-6">
                <svg viewBox="0 0 24 38" width="21" height="33" fill="none">
                    <path d="M 12 2 C 18 10 18 28 12 36 C 6 28 6 10 12 2 Z" fill="#c5a059" opacity="0.20" />
                    <line x1="12" y1="6" x2="12" y2="32" stroke="#8c6b2d" strokeWidth="0.8" opacity="0.3" />
                </svg>
            </div>

            {/* Pearl Millet & Sprouted Seed Beads */}
            <div className="floating-grain grain-seed-7">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
                    <circle cx="10" cy="10" r="7" fill="#d4af37" opacity="0.25" />
                    <circle cx="8" cy="8" r="2.5" fill="#ffffff" opacity="0.35" />
                </svg>
            </div>

            <div className="floating-grain grain-seed-8">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                    <circle cx="10" cy="10" r="7" fill="#c5a059" opacity="0.22" />
                    <circle cx="8" cy="8" r="2.5" fill="#ffffff" opacity="0.35" />
                </svg>
            </div>

            <div className="floating-grain grain-seed-9">
                <svg viewBox="0 0 20 20" width="13" height="13" fill="none">
                    <circle cx="10" cy="10" r="7" fill="#966d24" opacity="0.26" />
                    <circle cx="8" cy="8" r="2.5" fill="#ffffff" opacity="0.4" />
                </svg>
            </div>

            <div className="floating-grain grain-seed-10">
                <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
                    <circle cx="10" cy="10" r="7" fill="#d4af37" opacity="0.22" />
                    <circle cx="8" cy="8" r="2.5" fill="#ffffff" opacity="0.35" />
                </svg>
            </div>

            {/* Sprouted Grain with Delicate Bio-Activated Sprout Tail */}
            <div className="floating-grain grain-seed-11">
                <svg viewBox="0 0 24 30" width="18" height="24" fill="none">
                    <path d="M 12 10 C 17 15 17 25 12 28 C 7 25 7 15 12 10 Z" fill="#c5a059" opacity="0.22" />
                    {/* Tiny Sprout Tail */}
                    <path d="M 12 10 C 11 5 15 2 18 3" stroke="#5d8248" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
                </svg>
            </div>

            <div className="floating-grain grain-seed-12">
                <svg viewBox="0 0 24 30" width="16" height="22" fill="none">
                    <path d="M 12 10 C 17 15 17 25 12 28 C 7 25 7 15 12 10 Z" fill="#d4af37" opacity="0.20" />
                    <path d="M 12 10 C 11 5 15 2 18 3" stroke="#5d8248" strokeWidth="1.2" strokeLinecap="round" opacity="0.28" />
                </svg>
            </div>

            {/* Subtle Harvest Ambient Farm Glow */}
            <div className="bg-harvest-ambient ambient-top-left"></div>
            <div className="bg-harvest-ambient ambient-top-right"></div>
            <div className="bg-harvest-ambient ambient-bottom-left"></div>
            <div className="bg-harvest-ambient ambient-bottom-right"></div>
        </div>
    );
}
