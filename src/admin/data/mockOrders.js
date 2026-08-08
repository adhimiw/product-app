import { ORDER_STATUSES, PAYMENT_STATUSES } from '../constants/orderStatuses';

export const MOCK_ORDERS = [
    {
        id: 'ORD-9482',
        customer: {
            name: 'Priya Sundaram',
            email: 'priya.sundaram@gmail.com',
            phone: '+91 98401 23456',
            address: '12-A Sunrise Apartments, Adyar, Chennai, Tamil Nadu 600020'
        },
        items: [
            { id: 1, name: 'Amutham Sprouted Health Mix (1kg)', quantity: 2, price: 450 },
            { id: 2, name: 'Sprouted Ragi & Almond Mix (500g)', quantity: 1, price: 299 }
        ],
        totalAmount: 1199,
        paymentStatus: PAYMENT_STATUSES.PAID,
        orderStatus: ORDER_STATUSES.PENDING,
        createdAt: '2026-08-08T01:45:00.000Z',
        notes: 'Requested eco-friendly packaging if possible.'
    },
    {
        id: 'ORD-9481',
        customer: {
            name: 'Anand Viswanathan',
            email: 'anand.v@outlook.com',
            phone: '+91 97902 88192',
            address: '45 Greenways Road, R.A. Puram, Chennai 600028'
        },
        items: [
            { id: 3, name: 'Traditional Pearl Millet Porridge (750g)', quantity: 3, price: 340 }
        ],
        totalAmount: 1020,
        paymentStatus: PAYMENT_STATUSES.PAID,
        orderStatus: ORDER_STATUSES.PROCESSING,
        createdAt: '2026-08-07T19:30:00.000Z',
        notes: ''
    },
    {
        id: 'ORD-9480',
        customer: {
            name: 'Kavitha Sethuraman',
            email: 'kavitha.sethu@yahoo.in',
            phone: '+91 94443 11099',
            address: '88 Trunk Road, Sethiyathope, Cuddalore Dist. 608702'
        },
        items: [
            { id: 1, name: 'Amutham Sprouted Health Mix (1kg)', quantity: 4, price: 450 },
            { id: 4, name: 'Sprouted Multigrain & Cardamom Powder (500g)', quantity: 2, price: 320 }
        ],
        totalAmount: 2440,
        paymentStatus: PAYMENT_STATUSES.PAID,
        orderStatus: ORDER_STATUSES.CONFIRMED,
        createdAt: '2026-08-07T16:15:00.000Z',
        notes: 'Store pickup requested at Sethiyathope center.'
    },
    {
        id: 'ORD-9479',
        customer: {
            name: 'Karthik Raja',
            email: 'karthik.raja89@gmail.com',
            phone: '+91 98840 55123',
            address: '3/202 East Coast Road, Neelankarai, Chennai 600115'
        },
        items: [
            { id: 5, name: 'Organic Sprouted Barley Malt (500g)', quantity: 2, price: 280 }
        ],
        totalAmount: 560,
        paymentStatus: PAYMENT_STATUSES.PAID,
        orderStatus: ORDER_STATUSES.SHIPPED,
        createdAt: '2026-08-06T14:20:00.000Z',
        notes: 'Dispatched via BlueDart Express (Tracking #BD772819)'
    },
    {
        id: 'ORD-9478',
        customer: {
            name: 'Meera Ramachandran',
            email: 'meera.ram@gmail.com',
            phone: '+91 91766 43210',
            address: '56 Anna Salai, Chidambaram 608001'
        },
        items: [
            { id: 1, name: 'Amutham Sprouted Health Mix (1kg)', quantity: 1, price: 450 },
            { id: 2, name: 'Sprouted Ragi & Almond Mix (500g)', quantity: 2, price: 299 }
        ],
        totalAmount: 1048,
        paymentStatus: PAYMENT_STATUSES.PAID,
        orderStatus: ORDER_STATUSES.DELIVERED,
        createdAt: '2026-08-05T11:05:00.000Z',
        notes: 'Delivered successfully on 07/08/2026'
    },
    {
        id: 'ORD-9477',
        customer: {
            name: 'Suresh Kumar',
            email: 'suresh.k@hotmail.com',
            phone: '+91 99620 90807',
            address: '14 West Car Street, Neyveli 607801'
        },
        items: [
            { id: 3, name: 'Traditional Pearl Millet Porridge (750g)', quantity: 1, price: 340 }
        ],
        totalAmount: 340,
        paymentStatus: PAYMENT_STATUSES.FAILED,
        orderStatus: ORDER_STATUSES.CANCELLED,
        createdAt: '2026-08-04T09:40:00.000Z',
        notes: 'Payment failed at gateway, user cancelled transaction.'
    },
    {
        id: 'ORD-9476',
        customer: {
            name: 'Deepa Venkat',
            email: 'deepa.venkat@gmail.com',
            phone: '+91 98410 77334',
            address: '102 Main Road, Panruti, Cuddalore 607106'
        },
        items: [
            { id: 1, name: 'Amutham Sprouted Health Mix (1kg)', quantity: 3, price: 450 }
        ],
        totalAmount: 1350,
        paymentStatus: PAYMENT_STATUSES.PAID,
        orderStatus: ORDER_STATUSES.DELIVERED,
        createdAt: '2026-08-03T17:50:00.000Z',
        notes: ''
    },
    {
        id: 'ORD-9475',
        customer: {
            name: 'Rajesh Gopinath',
            email: 'rgopinath@rediffmail.com',
            phone: '+91 97100 22341',
            address: '22 Bazaar Street, Vriddhachalam 606001'
        },
        items: [
            { id: 4, name: 'Sprouted Multigrain & Cardamom Powder (500g)', quantity: 2, price: 320 }
        ],
        totalAmount: 640,
        paymentStatus: PAYMENT_STATUSES.PAID,
        orderStatus: ORDER_STATUSES.PROCESSING,
        createdAt: '2026-08-03T10:15:00.000Z',
        notes: 'Order in assembly.'
    }
];
