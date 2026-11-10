const fs = require('fs');

let content = fs.readFileSync('src/admin/pages/AdminProducts.jsx', 'utf8');

// 1. Add imports
content = content.replace(
    "import { adminProductService, BADGE_OPTIONS, getBadgeLabel } from '../services/adminProductService';",
    "import { adminProductService, BADGE_OPTIONS, getBadgeLabel, PACKAGE_SIZE_OPTIONS, VARIANT_STATUS_OPTIONS } from '../services/adminProductService';"
);

// 2. Add Package Size & Status to newPackage object template
content = content.replace(
    "size_number: 1, size_unit: 'pack', pieces_count: '', variant_price: '', variant_badge: 0,",
    "size_number: 1, size_unit: 'pack', pieces_count: '', package_size: '', status: 1, variant_price: '', variant_badge: 0,"
);

// 3. Update Row 1 to include Package Size Dropdown
const oldRow1 = `<label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>Size Number</label>`;
const newRow1 = `<div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>Package Size (Optional)</label>
                                                                <select
                                                                    className="admin-input"
                                                                    value={pkg.package_size || ''}
                                                                    onChange={(e) => handlePackageChange(pkg.id, 'package_size', e.target.value)}
                                                                >
                                                                    {PACKAGE_SIZE_OPTIONS.map(opt => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>Size Number</label>`;

if (content.includes(oldRow1) && !content.includes('Package Size (Optional)')) {
    content = content.replace(oldRow1, newRow1);
}

// 4. Update Row 2 to include Variant Status Dropdown
const oldRow2End = `</label>
                                                                </div>
                                                            </div>
                                                        </div>`;

const newRow2End = `</label>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>Variant Status</label>
                                                                <select
                                                                    className="admin-input"
                                                                    value={pkg.status !== undefined && pkg.status !== null ? Number(pkg.status) : 1}
                                                                    onChange={(e) => handlePackageChange(pkg.id, 'status', Number(e.target.value))}
                                                                >
                                                                    {VARIANT_STATUS_OPTIONS.map(opt => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>`;

if (content.includes(oldRow2End) && !content.includes('Variant Status</label>')) {
    content = content.replace(oldRow2End, newRow2End);
}

fs.writeFileSync('src/admin/pages/AdminProducts.jsx', content, 'utf8');
console.log('ADMIN_PRODUCTS_UPDATED_SUCCESS');
