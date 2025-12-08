import { Delivery, DeliveryStats } from './types/delivery';

// Mock deliveries data
export const DELIVERIES_MOCK: Delivery[] = [
  {
    _id: '1',
    deliveryCode: 'DEL-001',
    routeId: 'route-1',
    routeName: 'Central Business District Route',
    riderId: 'rider-1',
    riderName: 'John Kamau',
    riderPhone: '+254712345001',
    shops: [
      {
        shopId: 'shop-1',
        shopName: 'Downtown Mart',
        address: 'Kenyatta Avenue, Nairobi CBD',
        coordinates: { lat: -1.2864, lng: 36.8172 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T08:30:00'),
        completedAt: new Date('2024-03-15T08:45:00'),
        deliveryNote: 'Delivered to manager'
      },
      {
        shopId: 'shop-2',
        shopName: 'City Plaza Store',
        address: 'Moi Avenue, Nairobi',
        coordinates: { lat: -1.2875, lng: 36.8180 },
        sequenceNumber: 2,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T09:00:00'),
        completedAt: new Date('2024-03-15T09:20:00')
      },
      {
        shopId: 'shop-3',
        shopName: 'Central Supermarket',
        address: 'Tom Mboya Street, Nairobi',
        coordinates: { lat: -1.2850, lng: 36.8210 },
        sequenceNumber: 3,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T09:35:00'),
        completedAt: new Date('2024-03-15T09:50:00')
      }
    ],
    orderIds: ['order-101', 'order-102', 'order-103'],
    status: 'completed',
    totalAmount: 45000,
    collectedAmount: 45000,
    remainingAmount: 0,
    paymentStatus: 'complete',
    startedAt: new Date('2024-03-15T08:20:00'),
    completedAt: new Date('2024-03-15T09:50:00'),
    createdAt: new Date('2024-03-15T06:00:00'),
    updatedAt: new Date('2024-03-15T09:50:00')
  },
  {
    _id: '2',
    deliveryCode: 'DEL-002',
    routeId: 'route-2',
    routeName: 'Westlands Commercial Route',
    riderId: 'rider-2',
    riderName: 'Peter Omondi',
    riderPhone: '+254712345002',
    shops: [
      {
        shopId: 'shop-4',
        shopName: 'Westlands Mall Store',
        address: 'Westlands, Nairobi',
        coordinates: { lat: -1.2675, lng: 36.8075 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T09:00:00'),
        completedAt: new Date('2024-03-15T09:25:00')
      },
      {
        shopId: 'shop-5',
        shopName: 'Sarit Center Shop',
        address: 'Karuna Road, Westlands',
        coordinates: { lat: -1.2620, lng: 36.8050 },
        sequenceNumber: 2,
        status: 'in-progress',
        arrivedAt: new Date('2024-03-15T09:45:00')
      },
      {
        shopId: 'shop-6',
        shopName: 'Parklands Traders',
        address: 'Parklands Avenue',
        coordinates: { lat: -1.2580, lng: 36.8120 },
        sequenceNumber: 3,
        status: 'pending'
      }
    ],
    orderIds: ['order-104', 'order-105', 'order-106'],
    status: 'in-progress',
    totalAmount: 62000,
    collectedAmount: 28000,
    remainingAmount: 34000,
    paymentStatus: 'partial',
    startedAt: new Date('2024-03-15T08:50:00'),
    createdAt: new Date('2024-03-15T06:30:00'),
    updatedAt: new Date('2024-03-15T09:45:00')
  },
  {
    _id: '3',
    deliveryCode: 'DEL-003',
    routeId: 'route-3',
    routeName: 'Industrial Area Route',
    riderId: 'rider-3',
    riderName: 'David Mwangi',
    riderPhone: '+254712345003',
    shops: [
      {
        shopId: 'shop-7',
        shopName: 'Industrial Supplies Co',
        address: 'Enterprise Road, Industrial Area',
        coordinates: { lat: -1.3200, lng: 36.8500 },
        sequenceNumber: 1,
        status: 'pending'
      },
      {
        shopId: 'shop-8',
        shopName: 'Metro Wholesale',
        address: 'Dar es Salaam Road',
        coordinates: { lat: -1.3180, lng: 36.8520 },
        sequenceNumber: 2,
        status: 'pending'
      }
    ],
    orderIds: ['order-107', 'order-108'],
    status: 'pending',
    totalAmount: 85000,
    collectedAmount: 0,
    remainingAmount: 85000,
    paymentStatus: 'pending',
    createdAt: new Date('2024-03-15T07:00:00'),
    updatedAt: new Date('2024-03-15T07:00:00')
  },
  {
    _id: '4',
    deliveryCode: 'DEL-004',
    routeId: 'route-4',
    routeName: 'Eastlands Route',
    riderId: 'rider-4',
    riderName: 'James Otieno',
    riderPhone: '+254712345004',
    shops: [
      {
        shopId: 'shop-9',
        shopName: 'Umoja Market',
        address: 'Umoja Estate, Nairobi',
        coordinates: { lat: -1.2700, lng: 36.8900 },
        sequenceNumber: 1,
        status: 'failed',
        arrivedAt: new Date('2024-03-15T10:00:00'),
        deliveryNote: 'Shop closed'
      },
      {
        shopId: 'shop-10',
        shopName: 'Donholm Traders',
        address: 'Donholm, Nairobi',
        coordinates: { lat: -1.2750, lng: 36.9000 },
        sequenceNumber: 2,
        status: 'failed',
        arrivedAt: new Date('2024-03-15T10:30:00'),
        deliveryNote: 'Customer unavailable'
      }
    ],
    orderIds: ['order-109', 'order-110'],
    status: 'failed',
    totalAmount: 38000,
    collectedAmount: 0,
    remainingAmount: 38000,
    paymentStatus: 'pending',
    startedAt: new Date('2024-03-15T09:45:00'),
    failureReason: 'Multiple shop closures and unavailability',
    createdAt: new Date('2024-03-15T07:30:00'),
    updatedAt: new Date('2024-03-15T10:45:00')
  },
  {
    _id: '5',
    deliveryCode: 'DEL-005',
    routeId: 'route-5',
    routeName: 'Karen Langata Route',
    riderId: 'rider-5',
    riderName: 'Michael Wanjala',
    riderPhone: '+254712345005',
    shops: [
      {
        shopId: 'shop-11',
        shopName: 'Karen Shopping Center',
        address: 'Karen Road, Nairobi',
        coordinates: { lat: -1.3180, lng: 36.7080 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T08:45:00'),
        completedAt: new Date('2024-03-15T09:10:00')
      },
      {
        shopId: 'shop-12',
        shopName: 'Langata Link Store',
        address: 'Langata Road',
        coordinates: { lat: -1.3350, lng: 36.7420 },
        sequenceNumber: 2,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T09:30:00'),
        completedAt: new Date('2024-03-15T09:50:00')
      },
      {
        shopId: 'shop-13',
        shopName: 'Bomas Market',
        address: 'Magadi Road',
        coordinates: { lat: -1.3500, lng: 36.7350 },
        sequenceNumber: 3,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T10:10:00'),
        completedAt: new Date('2024-03-15T10:30:00')
      },
      {
        shopId: 'shop-14',
        shopName: 'Rongai Supplies',
        address: 'Rongai Town',
        coordinates: { lat: -1.3900, lng: 36.7500 },
        sequenceNumber: 4,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T11:00:00'),
        completedAt: new Date('2024-03-15T11:20:00')
      }
    ],
    orderIds: ['order-111', 'order-112', 'order-113', 'order-114'],
    status: 'completed',
    totalAmount: 72000,
    collectedAmount: 72000,
    remainingAmount: 0,
    paymentStatus: 'complete',
    startedAt: new Date('2024-03-15T08:30:00'),
    completedAt: new Date('2024-03-15T11:20:00'),
    createdAt: new Date('2024-03-15T06:15:00'),
    updatedAt: new Date('2024-03-15T11:20:00')
  },
  {
    _id: '6',
    deliveryCode: 'DEL-006',
    routeId: 'route-6',
    routeName: 'Thika Road Route',
    riderId: 'rider-6',
    riderName: 'Simon Kariuki',
    riderPhone: '+254712345006',
    shops: [
      {
        shopId: 'shop-15',
        shopName: 'Roysambu Market',
        address: 'Thika Road, Roysambu',
        coordinates: { lat: -1.2150, lng: 36.8900 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T09:15:00'),
        completedAt: new Date('2024-03-15T09:40:00')
      },
      {
        shopId: 'shop-16',
        shopName: 'Kasarani Traders',
        address: 'Kasarani Area',
        coordinates: { lat: -1.2200, lng: 36.9000 },
        sequenceNumber: 2,
        status: 'in-progress',
        arrivedAt: new Date('2024-03-15T10:00:00')
      },
      {
        shopId: 'shop-17',
        shopName: 'Ruiru Junction Store',
        address: 'Ruiru Town',
        coordinates: { lat: -1.1450, lng: 36.9650 },
        sequenceNumber: 3,
        status: 'pending'
      }
    ],
    orderIds: ['order-115', 'order-116', 'order-117'],
    status: 'in-progress',
    totalAmount: 55000,
    collectedAmount: 23000,
    remainingAmount: 32000,
    paymentStatus: 'partial',
    startedAt: new Date('2024-03-15T09:00:00'),
    createdAt: new Date('2024-03-15T07:15:00'),
    updatedAt: new Date('2024-03-15T10:00:00')
  },
  {
    _id: '7',
    deliveryCode: 'DEL-007',
    routeId: 'route-7',
    routeName: 'Ngong Road Route',
    riderId: 'rider-7',
    riderName: 'Joseph Kipchoge',
    riderPhone: '+254712345007',
    shops: [
      {
        shopId: 'shop-18',
        shopName: 'Kilimani Wholesale',
        address: 'Kilimani, Nairobi',
        coordinates: { lat: -1.2950, lng: 36.7820 },
        sequenceNumber: 1,
        status: 'pending'
      },
      {
        shopId: 'shop-19',
        shopName: 'Ngong Road Plaza',
        address: 'Ngong Road',
        coordinates: { lat: -1.3050, lng: 36.7650 },
        sequenceNumber: 2,
        status: 'pending'
      },
      {
        shopId: 'shop-20',
        shopName: 'Adams Arcade Shop',
        address: 'Adams Arcade',
        coordinates: { lat: -1.3100, lng: 36.7700 },
        sequenceNumber: 3,
        status: 'pending'
      }
    ],
    orderIds: ['order-118', 'order-119', 'order-120'],
    status: 'pending',
    totalAmount: 48000,
    collectedAmount: 0,
    remainingAmount: 48000,
    paymentStatus: 'pending',
    createdAt: new Date('2024-03-15T07:45:00'),
    updatedAt: new Date('2024-03-15T07:45:00')
  },
  {
    _id: '8',
    deliveryCode: 'DEL-008',
    routeId: 'route-8',
    routeName: 'Mombasa Road Route',
    riderId: 'rider-1',
    riderName: 'John Kamau',
    riderPhone: '+254712345001',
    shops: [
      {
        shopId: 'shop-21',
        shopName: 'Syokimau Market',
        address: 'Syokimau, Machakos',
        coordinates: { lat: -1.3700, lng: 36.9350 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T11:00:00'),
        completedAt: new Date('2024-03-15T11:25:00')
      },
      {
        shopId: 'shop-22',
        shopName: 'Mlolongo Traders',
        address: 'Mlolongo Town',
        coordinates: { lat: -1.3850, lng: 36.9500 },
        sequenceNumber: 2,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T11:45:00'),
        completedAt: new Date('2024-03-15T12:05:00')
      }
    ],
    orderIds: ['order-121', 'order-122'],
    status: 'completed',
    totalAmount: 41000,
    collectedAmount: 41000,
    remainingAmount: 0,
    paymentStatus: 'complete',
    startedAt: new Date('2024-03-15T10:45:00'),
    completedAt: new Date('2024-03-15T12:05:00'),
    createdAt: new Date('2024-03-15T08:00:00'),
    updatedAt: new Date('2024-03-15T12:05:00')
  },
  {
    _id: '9',
    deliveryCode: 'DEL-009',
    routeId: 'route-9',
    routeName: 'Upper Hill Route',
    riderId: 'rider-8',
    riderName: 'Patrick Mutua',
    riderPhone: '+254712345008',
    shops: [
      {
        shopId: 'shop-23',
        shopName: 'Upper Hill Medical Supplies',
        address: 'Upper Hill, Nairobi',
        coordinates: { lat: -1.2920, lng: 36.8250 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T14:00:00'),
        completedAt: new Date('2024-03-14T14:30:00')
      },
      {
        shopId: 'shop-24',
        shopName: 'Ralph Bunche Store',
        address: 'Ralph Bunche Road',
        coordinates: { lat: -1.2880, lng: 36.8200 },
        sequenceNumber: 2,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T14:50:00'),
        completedAt: new Date('2024-03-14T15:10:00')
      }
    ],
    orderIds: ['order-123', 'order-124'],
    status: 'completed',
    totalAmount: 35000,
    collectedAmount: 35000,
    remainingAmount: 0,
    paymentStatus: 'complete',
    startedAt: new Date('2024-03-14T13:45:00'),
    completedAt: new Date('2024-03-14T15:10:00'),
    createdAt: new Date('2024-03-14T10:00:00'),
    updatedAt: new Date('2024-03-14T15:10:00')
  },
  {
    _id: '10',
    deliveryCode: 'DEL-010',
    routeId: 'route-10',
    routeName: 'South B Route',
    riderId: 'rider-9',
    riderName: 'George Njoroge',
    riderPhone: '+254712345009',
    shops: [
      {
        shopId: 'shop-25',
        shopName: 'South B Shopping Mall',
        address: 'South B, Nairobi',
        coordinates: { lat: -1.3120, lng: 36.8350 },
        sequenceNumber: 1,
        status: 'in-progress',
        arrivedAt: new Date('2024-03-15T10:30:00')
      },
      {
        shopId: 'shop-26',
        shopName: 'South C Traders',
        address: 'South C Estate',
        coordinates: { lat: -1.3200, lng: 36.8300 },
        sequenceNumber: 2,
        status: 'pending'
      },
      {
        shopId: 'shop-27',
        shopName: 'Nyayo Stadium Store',
        address: 'Near Nyayo Stadium',
        coordinates: { lat: -1.3150, lng: 36.8280 },
        sequenceNumber: 3,
        status: 'pending'
      }
    ],
    orderIds: ['order-125', 'order-126', 'order-127'],
    status: 'in-progress',
    totalAmount: 52000,
    collectedAmount: 0,
    remainingAmount: 52000,
    paymentStatus: 'pending',
    startedAt: new Date('2024-03-15T10:15:00'),
    createdAt: new Date('2024-03-15T08:30:00'),
    updatedAt: new Date('2024-03-15T10:30:00')
  },
  {
    _id: '11',
    deliveryCode: 'DEL-011',
    routeId: 'route-11',
    routeName: 'Embakasi Route',
    riderId: 'rider-10',
    riderName: 'Francis Ochieng',
    riderPhone: '+254712345010',
    shops: [
      {
        shopId: 'shop-28',
        shopName: 'Embakasi Village Market',
        address: 'Embakasi Village',
        coordinates: { lat: -1.3200, lng: 36.8950 },
        sequenceNumber: 1,
        status: 'pending'
      },
      {
        shopId: 'shop-29',
        shopName: 'Pipeline Supplies',
        address: 'Pipeline Estate',
        coordinates: { lat: -1.3280, lng: 36.8850 },
        sequenceNumber: 2,
        status: 'pending'
      }
    ],
    orderIds: ['order-128', 'order-129'],
    status: 'pending',
    totalAmount: 39000,
    collectedAmount: 0,
    remainingAmount: 39000,
    paymentStatus: 'pending',
    createdAt: new Date('2024-03-15T08:45:00'),
    updatedAt: new Date('2024-03-15T08:45:00')
  },
  {
    _id: '12',
    deliveryCode: 'DEL-012',
    routeId: 'route-12',
    routeName: 'Kiambu Road Route',
    riderId: 'rider-2',
    riderName: 'Peter Omondi',
    riderPhone: '+254712345002',
    shops: [
      {
        shopId: 'shop-30',
        shopName: 'Banana Market',
        address: 'Banana, Kiambu Road',
        coordinates: { lat: -1.2150, lng: 36.8450 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T09:00:00'),
        completedAt: new Date('2024-03-14T09:30:00')
      },
      {
        shopId: 'shop-31',
        shopName: 'Runda Mall',
        address: 'Runda Estate',
        coordinates: { lat: -1.2100, lng: 36.8350 },
        sequenceNumber: 2,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T09:50:00'),
        completedAt: new Date('2024-03-14T10:15:00')
      },
      {
        shopId: 'shop-32',
        shopName: 'Kiambu Town Center',
        address: 'Kiambu Town',
        coordinates: { lat: -1.1714, lng: 36.8356 },
        sequenceNumber: 3,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T10:45:00'),
        completedAt: new Date('2024-03-14T11:10:00')
      }
    ],
    orderIds: ['order-130', 'order-131', 'order-132'],
    status: 'completed',
    totalAmount: 68000,
    collectedAmount: 68000,
    remainingAmount: 0,
    paymentStatus: 'complete',
    startedAt: new Date('2024-03-14T08:45:00'),
    completedAt: new Date('2024-03-14T11:10:00'),
    createdAt: new Date('2024-03-14T07:00:00'),
    updatedAt: new Date('2024-03-14T11:10:00')
  },
  {
    _id: '13',
    deliveryCode: 'DEL-013',
    routeId: 'route-13',
    routeName: 'Nairobi West Route',
    riderId: 'rider-3',
    riderName: 'David Mwangi',
    riderPhone: '+254712345003',
    shops: [
      {
        shopId: 'shop-33',
        shopName: 'Nairobi West Shopping',
        address: 'Nairobi West',
        coordinates: { lat: -1.3250, lng: 36.8100 },
        sequenceNumber: 1,
        status: 'failed',
        arrivedAt: new Date('2024-03-14T13:00:00'),
        deliveryNote: 'Wrong address provided'
      }
    ],
    orderIds: ['order-133'],
    status: 'failed',
    totalAmount: 28000,
    collectedAmount: 0,
    remainingAmount: 28000,
    paymentStatus: 'pending',
    startedAt: new Date('2024-03-14T12:45:00'),
    failureReason: 'Incorrect delivery address',
    createdAt: new Date('2024-03-14T09:00:00'),
    updatedAt: new Date('2024-03-14T13:15:00')
  },
  {
    _id: '14',
    deliveryCode: 'DEL-014',
    routeId: 'route-14',
    routeName: 'Jogoo Road Route',
    riderId: 'rider-4',
    riderName: 'James Otieno',
    riderPhone: '+254712345004',
    shops: [
      {
        shopId: 'shop-34',
        shopName: 'Jogoo Road Market',
        address: 'Jogoo Road, Nairobi',
        coordinates: { lat: -1.2900, lng: 36.8550 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T08:00:00'),
        completedAt: new Date('2024-03-15T08:25:00')
      },
      {
        shopId: 'shop-35',
        shopName: 'Makadara Traders',
        address: 'Makadara Area',
        coordinates: { lat: -1.2950, lng: 36.8600 },
        sequenceNumber: 2,
        status: 'completed',
        arrivedAt: new Date('2024-03-15T08:45:00'),
        completedAt: new Date('2024-03-15T09:05:00')
      }
    ],
    orderIds: ['order-134', 'order-135'],
    status: 'completed',
    totalAmount: 33000,
    collectedAmount: 33000,
    remainingAmount: 0,
    paymentStatus: 'complete',
    startedAt: new Date('2024-03-15T07:45:00'),
    completedAt: new Date('2024-03-15T09:05:00'),
    createdAt: new Date('2024-03-15T06:30:00'),
    updatedAt: new Date('2024-03-15T09:05:00')
  },
  {
    _id: '15',
    deliveryCode: 'DEL-015',
    routeId: 'route-15',
    routeName: 'Githurai Route',
    riderId: 'rider-5',
    riderName: 'Michael Wanjala',
    riderPhone: '+254712345005',
    shops: [
      {
        shopId: 'shop-36',
        shopName: 'Githurai 44 Market',
        address: 'Githurai 44',
        coordinates: { lat: -1.1650, lng: 36.9150 },
        sequenceNumber: 1,
        status: 'in-progress',
        arrivedAt: new Date('2024-03-15T10:45:00')
      },
      {
        shopId: 'shop-37',
        shopName: 'Githurai 45 Supplies',
        address: 'Githurai 45',
        coordinates: { lat: -1.1600, lng: 36.9200 },
        sequenceNumber: 2,
        status: 'pending'
      },
      {
        shopId: 'shop-38',
        shopName: 'Zimmerman Market',
        address: 'Zimmerman Area',
        coordinates: { lat: -1.1800, lng: 36.8900 },
        sequenceNumber: 3,
        status: 'pending'
      }
    ],
    orderIds: ['order-136', 'order-137', 'order-138'],
    status: 'in-progress',
    totalAmount: 57000,
    collectedAmount: 0,
    remainingAmount: 57000,
    paymentStatus: 'pending',
    startedAt: new Date('2024-03-15T10:30:00'),
    createdAt: new Date('2024-03-15T09:00:00'),
    updatedAt: new Date('2024-03-15T10:45:00')
  },
  {
    _id: '16',
    deliveryCode: 'DEL-016',
    routeId: 'route-16',
    routeName: 'Kangemi Route',
    riderId: 'rider-6',
    riderName: 'Simon Kariuki',
    riderPhone: '+254712345006',
    shops: [
      {
        shopId: 'shop-39',
        shopName: 'Kangemi Market',
        address: 'Kangemi, Nairobi',
        coordinates: { lat: -1.2750, lng: 36.7500 },
        sequenceNumber: 1,
        status: 'pending'
      },
      {
        shopId: 'shop-40',
        shopName: 'Mountain View Traders',
        address: 'Mountain View Estate',
        coordinates: { lat: -1.2700, lng: 36.7450 },
        sequenceNumber: 2,
        status: 'pending'
      }
    ],
    orderIds: ['order-139', 'order-140'],
    status: 'pending',
    totalAmount: 44000,
    collectedAmount: 0,
    remainingAmount: 44000,
    paymentStatus: 'pending',
    createdAt: new Date('2024-03-15T09:15:00'),
    updatedAt: new Date('2024-03-15T09:15:00')
  },
  {
    _id: '17',
    deliveryCode: 'DEL-017',
    routeId: 'route-17',
    routeName: 'Buruburu Route',
    riderId: 'rider-7',
    riderName: 'Joseph Kipchoge',
    riderPhone: '+254712345007',
    shops: [
      {
        shopId: 'shop-41',
        shopName: 'Buruburu Shopping Center',
        address: 'Buruburu Phase 1',
        coordinates: { lat: -1.2850, lng: 36.8750 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T11:00:00'),
        completedAt: new Date('2024-03-14T11:30:00')
      },
      {
        shopId: 'shop-42',
        shopName: 'Jericho Market',
        address: 'Jericho Estate',
        coordinates: { lat: -1.2900, lng: 36.8700 },
        sequenceNumber: 2,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T11:50:00'),
        completedAt: new Date('2024-03-14T12:15:00')
      }
    ],
    orderIds: ['order-141', 'order-142'],
    status: 'completed',
    totalAmount: 47000,
    collectedAmount: 47000,
    remainingAmount: 0,
    paymentStatus: 'complete',
    startedAt: new Date('2024-03-14T10:45:00'),
    completedAt: new Date('2024-03-14T12:15:00'),
    createdAt: new Date('2024-03-14T08:30:00'),
    updatedAt: new Date('2024-03-14T12:15:00')
  },
  {
    _id: '18',
    deliveryCode: 'DEL-018',
    routeId: 'route-18',
    routeName: 'Rongai Route',
    riderId: 'rider-8',
    riderName: 'Patrick Mutua',
    riderPhone: '+254712345008',
    shops: [
      {
        shopId: 'shop-43',
        shopName: 'Rongai Town Market',
        address: 'Rongai Town Center',
        coordinates: { lat: -1.3900, lng: 36.7500 },
        sequenceNumber: 1,
        status: 'in-progress',
        arrivedAt: new Date('2024-03-15T11:00:00')
      },
      {
        shopId: 'shop-44',
        shopName: 'Rimpa Traders',
        address: 'Rimpa Area, Rongai',
        coordinates: { lat: -1.4000, lng: 36.7450 },
        sequenceNumber: 2,
        status: 'pending'
      }
    ],
    orderIds: ['order-143', 'order-144'],
    status: 'in-progress',
    totalAmount: 36000,
    collectedAmount: 0,
    remainingAmount: 36000,
    paymentStatus: 'pending',
    startedAt: new Date('2024-03-15T10:50:00'),
    createdAt: new Date('2024-03-15T09:30:00'),
    updatedAt: new Date('2024-03-15T11:00:00')
  },
  {
    _id: '19',
    deliveryCode: 'DEL-019',
    routeId: 'route-19',
    routeName: 'Kitengela Route',
    riderId: 'rider-9',
    riderName: 'George Njoroge',
    riderPhone: '+254712345009',
    shops: [
      {
        shopId: 'shop-45',
        shopName: 'Kitengela Plaza',
        address: 'Kitengela Town',
        coordinates: { lat: -1.4450, lng: 36.9550 },
        sequenceNumber: 1,
        status: 'pending'
      }
    ],
    orderIds: ['order-145'],
    status: 'pending',
    totalAmount: 30000,
    collectedAmount: 0,
    remainingAmount: 30000,
    paymentStatus: 'pending',
    createdAt: new Date('2024-03-15T09:45:00'),
    updatedAt: new Date('2024-03-15T09:45:00')
  },
  {
    _id: '20',
    deliveryCode: 'DEL-020',
    routeId: 'route-20',
    routeName: 'Ruaka Route',
    riderId: 'rider-10',
    riderName: 'Francis Ochieng',
    riderPhone: '+254712345010',
    shops: [
      {
        shopId: 'shop-46',
        shopName: 'Ruaka Town Center',
        address: 'Ruaka, Kiambu',
        coordinates: { lat: -1.2100, lng: 36.7900 },
        sequenceNumber: 1,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T10:00:00'),
        completedAt: new Date('2024-03-14T10:30:00')
      },
      {
        shopId: 'shop-47',
        shopName: 'Redhill Market',
        address: 'Redhill, Limuru Road',
        coordinates: { lat: -1.2050, lng: 36.7800 },
        sequenceNumber: 2,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T10:50:00'),
        completedAt: new Date('2024-03-14T11:15:00')
      },
      {
        shopId: 'shop-48',
        shopName: 'Two Rivers Mall Store',
        address: 'Two Rivers, Limuru Road',
        coordinates: { lat: -1.2200, lng: 36.8000 },
        sequenceNumber: 3,
        status: 'completed',
        arrivedAt: new Date('2024-03-14T11:35:00'),
        completedAt: new Date('2024-03-14T12:00:00')
      }
    ],
    orderIds: ['order-146', 'order-147', 'order-148'],
    status: 'completed',
    totalAmount: 65000,
    collectedAmount: 65000,
    remainingAmount: 0,
    paymentStatus: 'complete',
    startedAt: new Date('2024-03-14T09:45:00'),
    completedAt: new Date('2024-03-14T12:00:00'),
    createdAt: new Date('2024-03-14T08:00:00'),
    updatedAt: new Date('2024-03-14T12:00:00')
  }
];

// Helper function to get delivery statistics
export function getDeliveryStats(): DeliveryStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDeliveries = DELIVERIES_MOCK.filter(d => {
    const createdDate = new Date(d.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    return createdDate.getTime() === today.getTime();
  });

  const activeDeliveries = DELIVERIES_MOCK.filter(d =>
    d.status === 'pending' || d.status === 'in-progress'
  );

  const completedDeliveries = DELIVERIES_MOCK.filter(d => d.status === 'completed');
  const failedDeliveries = DELIVERIES_MOCK.filter(d => d.status === 'failed');

  const totalRevenue = completedDeliveries.reduce((sum, d) => sum + d.collectedAmount, 0);
  const pendingRevenue = activeDeliveries.reduce((sum, d) => sum + d.remainingAmount, 0);

  return {
    totalDeliveries: DELIVERIES_MOCK.length,
    activeDeliveries: activeDeliveries.length,
    completedDeliveries: completedDeliveries.length,
    failedDeliveries: failedDeliveries.length,
    todayDeliveries: todayDeliveries.length,
    totalRevenue,
    pendingRevenue,
    averageDeliveryTime: 2.5, // hours
    onTimeRate: 92 // percentage
  };
}
