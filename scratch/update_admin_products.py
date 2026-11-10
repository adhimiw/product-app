import os

with open('src/admin/pages/AdminProducts.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Update signature
code = code.replace(
    'export default function AdminProducts() {',
    'export default function AdminProducts({ onNavigateToAdd, onNavigateToEdit }) {'
)

# Update handleOpenCreateModal
create_old = '''    const handleOpenCreateModal = () => {
        setEditingProduct(null);'''

create_new = '''    const handleOpenCreateModal = () => {
        if (onNavigateToAdd) {
            onNavigateToAdd();
            return;
        }
        setEditingProduct(null);'''

if create_old in code:
    code = code.replace(create_old, create_new)

# Update handleOpenEditModal
edit_old = '''    const handleOpenEditModal = (product) => {
        setEditingProduct(product);'''

edit_new = '''    const handleOpenEditModal = (product) => {
        if (onNavigateToEdit) {
            onNavigateToEdit(product);
            return;
        }
        setEditingProduct(product);'''

if edit_old in code:
    code = code.replace(edit_old, edit_new)

with open('src/admin/pages/AdminProducts.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Successfully updated AdminProducts.jsx navigation handlers!')
