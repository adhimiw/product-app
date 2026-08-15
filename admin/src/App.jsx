import {
  Admin, Resource, List, Datagrid, TextField, NumberField, BooleanField, DateField, ImageField,
  Edit, Create, Show, SimpleForm, SimpleShowLayout, TextInput, NumberInput, BooleanInput,
  SelectInput, ImageInput, required,
} from 'react-admin'
import { dataProvider } from './dataProvider'
import { authProvider } from './authProvider'

const TAGS = [{ id: 'Starter', name: 'Starter' }, { id: 'Family', name: 'Family' }, { id: 'Premium', name: 'Premium' }]
const PLACEMENTS = [{ id: 'hero', name: 'Hero deck' }, { id: 'promo', name: 'Promo strip' }, { id: 'popup', name: 'Popup' }]
const DISCOUNTS = [{ id: 'PERCENTAGE', name: 'Percentage' }, { id: 'FIXED', name: 'Fixed amount' }]

/* ---------- Products ---------- */
const ProductList = () => (
  <List sort={{ field: 'order_weight', order: 'ASC' }}>
    <Datagrid rowClick="edit">
      <ImageField source="image_url" label="Image" sx={{ '& img': { maxWidth: 54, maxHeight: 54, objectFit: 'cover', borderRadius: 4 } }} />
      <TextField source="name" />
      <TextField source="id" label="Slug" />
      <TextField source="category" />
      <NumberField source="price" />
      <TextField source="tag" />
      <BooleanField source="is_active" />
      <NumberField source="order_weight" />
    </Datagrid>
  </List>
)
const ProductForm = ({ create }) => (
  <SimpleForm>
    {create && <TextInput source="id" label="Slug (unique id)" validate={required()} helperText="e.g. health-mix-300g" />}
    <TextInput source="name" validate={required()} fullWidth />
    <TextInput source="category" validate={required()} />
    <NumberInput source="price" validate={required()} />
    <TextInput source="inr_price" helperText="Leave blank to auto-generate from price" />
    <SelectInput source="tag" choices={TAGS} validate={required()} />
    <TextInput source="badge" />
    <TextInput source="description" multiline fullWidth />
    <TextInput source="lead" multiline fullWidth />
    <TextInput source="ingredients" multiline fullWidth />
    <TextInput source="about" multiline fullWidth />
    <ImageField source="image_url" label="Current image" />
    <ImageInput source="image_upload" label="Upload new image (auto-WebP)" accept={{ 'image/*': [] }}>
      <ImageField source="src" />
    </ImageInput>
    <BooleanInput source="is_active" defaultValue={true} />
    <NumberInput source="order_weight" defaultValue={0} />
  </SimpleForm>
)
const ProductEdit = () => <Edit><ProductForm /></Edit>
const ProductCreate = () => <Create><ProductForm create /></Create>

/* ---------- Banners ---------- */
const BannerList = () => (
  <List sort={{ field: 'order_weight', order: 'ASC' }}>
    <Datagrid rowClick="edit">
      <ImageField source="image_url" label="Image" sx={{ '& img': { maxWidth: 80, maxHeight: 48, objectFit: 'cover', borderRadius: 4 } }} />
      <TextField source="title" />
      <TextField source="placement" />
      <TextField source="badge" />
      <TextField source="cta_text" />
      <BooleanField source="active" />
      <NumberField source="order_weight" />
    </Datagrid>
  </List>
)
const BannerForm = () => (
  <SimpleForm>
    <TextInput source="title" validate={required()} fullWidth />
    <TextInput source="subtitle" fullWidth />
    <TextInput source="description" multiline fullWidth />
    <TextInput source="badge" />
    <TextInput source="cta_text" helperText="Button label" />
    <TextInput source="cta_page" helperText="Frontend page key: shop, science, about" />
    <SelectInput source="placement" choices={PLACEMENTS} defaultValue="hero" />
    <ImageField source="image_url" label="Current image" />
    <ImageInput source="image_upload" label="Upload image (auto-WebP)" accept={{ 'image/*': [] }}>
      <ImageField source="src" />
    </ImageInput>
    <BooleanInput source="active" defaultValue={true} />
    <NumberInput source="order_weight" defaultValue={0} />
  </SimpleForm>
)
const BannerEdit = () => <Edit><BannerForm /></Edit>
const BannerCreate = () => <Create><BannerForm /></Create>

/* ---------- Coupons ---------- */
const CouponList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="code" />
      <TextField source="discount_type" />
      <NumberField source="value" />
      <BooleanField source="active" />
      <NumberField source="min_subtotal" />
    </Datagrid>
  </List>
)
const CouponForm = () => (
  <SimpleForm>
    <TextInput source="code" validate={required()} />
    <SelectInput source="discount_type" choices={DISCOUNTS} defaultValue="PERCENTAGE" />
    <NumberInput source="value" validate={required()} helperText="10 = 10% or ₹10" />
    <NumberInput source="min_subtotal" defaultValue={0} />
    <BooleanInput source="active" defaultValue={true} />
  </SimpleForm>
)
const CouponEdit = () => <Edit><CouponForm /></Edit>
const CouponCreate = () => <Create><CouponForm /></Create>

/* ---------- Orders (read-only) ---------- */
const OrderList = () => (
  <List sort={{ field: 'created_at', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="mobile" />
      <NumberField source="total" />
      <TextField source="coupon_code" />
      <BooleanField source="whatsapp_sent" />
      <DateField source="created_at" showTime />
    </Datagrid>
  </List>
)
const OrderShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" /><TextField source="mobile" /><TextField source="address" />
      <NumberField source="subtotal" /><NumberField source="discount" /><NumberField source="total" />
      <TextField source="coupon_code" /><BooleanField source="whatsapp_sent" />
      <TextField source="whatsapp_error" /><DateField source="created_at" showTime />
    </SimpleShowLayout>
  </Show>
)

/* ---------- Site config (singleton) ---------- */
const SiteConfigList = () => (
  <List><Datagrid rowClick="edit"><TextField source="logo_title" /><TextField source="announcement_text" /><NumberField source="free_shipping_threshold" /></Datagrid></List>
)
const SiteConfigEdit = () => (
  <Edit><SimpleForm>
    <TextInput source="announcement_text" fullWidth />
    <TextInput source="logo_title" /><TextInput source="logo_subtitle" />
    <NumberInput source="free_shipping_threshold" />
    <TextInput source="owner_whatsapp_number" helperText="Country code + number, e.g. 919876543210" />
    <TextInput source="openwa_api_url" fullWidth /><TextInput source="openwa_session_id" />
  </SimpleForm></Edit>
)

export default function App() {
  return (
    <Admin dataProvider={dataProvider} authProvider={authProvider} title="Mangalam Admin">
      <Resource name="products" list={ProductList} edit={ProductEdit} create={ProductCreate} recordRepresentation="name" />
      <Resource name="banners" list={BannerList} edit={BannerEdit} create={BannerCreate} recordRepresentation="title" />
      <Resource name="coupons" list={CouponList} edit={CouponEdit} create={CouponCreate} recordRepresentation="code" />
      <Resource name="orders" list={OrderList} show={OrderShow} />
      <Resource name="site-config" list={SiteConfigList} edit={SiteConfigEdit} options={{ label: 'Site Settings' }} />
    </Admin>
  )
}
