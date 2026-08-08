import React from 'react';

export default function OrganicBackgroundOverlay() {
    return (
        <div className="organic-bg-theme-overlay" aria-hidden="true">
            {/* Top-to-Bottom Faded Tree Branch & Millet Vine SVG Line Art Watermarks */}
            <svg className="bg-tree-branch-svg left top" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-50 600C50 450 130 380 90 200C70 80 180 20 230 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M90 200C140 180 210 220 270 210" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M120 300C200 320 260 280 330 300" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M60 400C120 440 190 420 250 460" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Organic Leaf Nodes */}
                <path d="M230 0C240-10 260 0 250 15C240 25 220 15 230 0Z" fill="currentColor" opacity="0.3"/>
                <path d="M270 210C285 205 295 220 280 230C270 235 255 220 270 210Z" fill="currentColor" opacity="0.25"/>
                <path d="M330 300C345 295 355 315 340 325C330 330 315 315 330 300Z" fill="currentColor" opacity="0.22"/>
                <path d="M250 460C265 455 275 470 260 480C250 485 235 470 250 460Z" fill="currentColor" opacity="0.2"/>
            </svg>

            <svg className="bg-tree-branch-svg left bottom" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-30 0C60 150 140 250 100 420C80 520 190 580 240 600" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M100 420C150 400 220 440 280 430" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M130 250C210 270 270 230 340 250" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M70 120C130 160 200 140 260 180" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M280 430C295 425 305 440 290 450C280 455 265 440 280 430Z" fill="currentColor" opacity="0.25"/>
                <path d="M340 250C355 245 365 265 350 275C340 280 325 265 340 250Z" fill="currentColor" opacity="0.2"/>
            </svg>

            <svg className="bg-tree-branch-svg right top" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M450 600C350 450 270 380 310 200C330 80 220 20 170 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M310 200C260 180 190 220 130 210" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M280 300C200 320 140 280 70 300" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M340 400C280 440 210 420 150 460" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M170 0C160-10 140 0 150 15C160 25 180 15 170 0Z" fill="currentColor" opacity="0.3"/>
                <path d="M130 210C115 205 105 220 120 230C130 235 145 220 130 210Z" fill="currentColor" opacity="0.25"/>
                <path d="M70 300C55 295 45 315 60 325C70 330 85 315 70 300Z" fill="currentColor" opacity="0.22"/>
            </svg>

            <svg className="bg-tree-branch-svg right bottom" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M430 0C340 150 260 250 300 420C320 520 210 580 160 600" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M300 420C250 400 180 440 120 430" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M270 250C190 270 130 230 60 250" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M120 430C105 425 95 440 110 450C120 455 135 440 120 430Z" fill="currentColor" opacity="0.25"/>
            </svg>

            {/* Denser Array of Floating Faded Leaves & Botanical Sprout Icons */}
            <div className="floating-leaf leaf-1">🍃</div>
            <div className="floating-leaf leaf-2">🌿</div>
            <div className="floating-leaf leaf-3">🌾</div>
            <div className="floating-leaf leaf-4">🌱</div>
            <div className="floating-leaf leaf-5">🍃</div>
            <div className="floating-leaf leaf-6">🌿</div>
            <div className="floating-leaf leaf-7">🌾</div>
            <div className="floating-leaf leaf-8">🌱</div>
            <div className="floating-leaf leaf-9">🍃</div>
            <div className="floating-leaf leaf-10">🌿</div>
            <div className="floating-leaf leaf-11">🌾</div>
            <div className="floating-leaf leaf-12">🌱</div>
            <div className="floating-leaf leaf-13">🍃</div>
            <div className="floating-leaf leaf-14">🌿</div>

            {/* Golden Sunbeam Bokeh Light Particles */}
            <div className="sunbeam-particle p1"></div>
            <div className="sunbeam-particle p2"></div>
            <div className="sunbeam-particle p3"></div>
            <div className="sunbeam-particle p4"></div>
            <div className="sunbeam-particle p5"></div>
            <div className="sunbeam-particle p6"></div>

            {/* Soft Ambient Radial Blur Glow Orbs */}
            <div className="bg-glow-orb orb-top-left"></div>
            <div className="bg-glow-orb orb-mid-right"></div>
            <div className="bg-glow-orb orb-bottom-left"></div>
            <div className="bg-glow-orb orb-mid-left"></div>
        </div>
    );
}
