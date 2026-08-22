---
name: react-admin-uiux
description: >-
  UI/UX design standards for React admin panels, multi-step modal forms, image variant management,
  reordering controls, and rich text editor integration using Lucide icons.
---

# React Admin UI/UX Design Standards

## 1. Typography & Aesthetic Principles
- Primary font family: `Plus Jakarta Sans, sans-serif`.
- Color hierarchy:
  - Primary accents: Emerald (`#059669`, `#10b981`).
  - Neutral surfaces: Crisp Slate (`#f8fafc`, `#ffffff`).
  - Subtle borders: Slate-200 (`#e2e8f0`).
- No default unstyled browser buttons, text glyphs, or serif fonts.

## 2. Multi-Step Modal Architecture (`AdminProducts.jsx`)
- **Step 1: Basic Info & Tags**:
  - Name, Category dropdown, Slug, Actual Price, Offer Price, Stock, dynamic tag chips.
- **Step 2: Package Sizes & Variant Image Reordering**:
  - Package weight / variant rows.
  - Image gallery cards featuring overlay controls:
    - `←` Move Left
    - `→` Move Right
    - `👁️` Preview Full Size
    - `✏️` Replace Image
    - `🗑️` Remove Image
- **Step 3: Usage, Highlights & Ingredients**:
  - `RichTextEditor` components with `lucide-react` SVG buttons (`Bold`, `Italic`, `Underline`, `Strikethrough`, `Heading3`, `Type`, `List`, `ListOrdered`, `Eraser`).
  - Sticky bottom action footer with `<X />` Cancel, `<ArrowRight />` Next, and `<CheckCircle2 />` Save & Publish Product.

## 3. Form Clean Initial State Rule
Always reset form state cleanly when opening "Add Product" modal:
```javascript
const handleOpenAddModal = () => {
  setFormData({
    name: '',
    category_id: '',
    actual_price: '',
    offer_price: '',
    stock: '',
    tags: [],
    variants: [{ size: '500g', price: '', stock: '' }],
    variant_images: [],
    images: [],
    usage_instructions: '',
    health_benefits: '',
    ingredients: '',
  });
  setCurrentStep(1);
  setIsModalOpen(true);
};
```
Never display default dummy images or stale cached drafts in the creation modal.
