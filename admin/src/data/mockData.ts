export interface RecentOrder {
  id: string;
  product: string;
  farmer: string;
  seller: string;
  amount: string;
  status: 'In Transit' | 'Completed' | 'Payment Held';
  payment: 'Product Paid' | 'Completed' | 'Held by Green Hive';
}

export const mockStats = {
  totalUsers: '1,284',
  usersThisMonth: '+102 this month',
  activeOrders: '87',
  heldPayments: 'Rs. 2.85M',
  transportJobs: '43',
};

export const mockRoleCounts = {
  farmers: 632,
  sellers: 418,
  transporters: 234,
};

export const mockOrdersOverTime = [
  { month: 'Jan', orders: 110 },
  { month: 'Feb', orders: 135 },
  { month: 'Mar', orders: 150 },
  { month: 'Apr', orders: 190 },
  { month: 'May', orders: 220 },
  { month: 'Jun', orders: 260 },
  { month: 'Jul', orders: 312 },
  { month: 'Aug', orders: 270 },
  { month: 'Sep', orders: 285 },
  { month: 'Oct', orders: 310 },
  { month: 'Nov', orders: 340 },
  { month: 'Dec', orders: 360 },
];

export const mockRecentOrders: RecentOrder[] = [
  {
    id: '#GH-2041',
    product: 'Fresh Cabbage',
    farmer: 'Sunil Perera',
    seller: 'Colombo Fresh Market',
    amount: 'Rs. 9,500',
    status: 'In Transit',
    payment: 'Product Paid',
  },
  {
    id: '#GH-2035',
    product: 'Red Onions',
    farmer: 'Kamal Jayasinghe',
    seller: 'Kandy Supermart',
    amount: 'Rs. 37,500',
    status: 'Completed',
    payment: 'Completed',
  },
  {
    id: '#GH-2050',
    product: 'Ripe Tomatoes',
    farmer: 'Kamal Jayasinghe',
    seller: 'Colombo Fresh Market',
    amount: 'Rs. 15,500',
    status: 'Payment Held',
    payment: 'Held by Green Hive',
  },
];

// 12 Months: User Growth
export const mockUserGrowth = [
  { month: 'Jan', farmers: 350, sellers: 220, transporters: 120 },
  { month: 'Feb', farmers: 380, sellers: 250, transporters: 130 },
  { month: 'Mar', farmers: 420, sellers: 280, transporters: 140 },
  { month: 'Apr', farmers: 460, sellers: 310, transporters: 160 },
  { month: 'May', farmers: 500, sellers: 350, transporters: 180 },
  { month: 'Jun', farmers: 550, sellers: 380, transporters: 200 },
  { month: 'Jul', farmers: 590, sellers: 400, transporters: 220 },
  { month: 'Aug', farmers: 632, sellers: 418, transporters: 234 },
  { month: 'Sep', farmers: 660, sellers: 435, transporters: 245 },
  { month: 'Oct', farmers: 700, sellers: 460, transporters: 260 },
  { month: 'Nov', farmers: 740, sellers: 485, transporters: 275 },
  { month: 'Dec', farmers: 780, sellers: 510, transporters: 290 },
];

// 12 Months: Transaction Volume (in Millions)
export const mockTransactionVolume = [
  { month: 'Jan', product: 2.2, transport: 0.3 },
  { month: 'Feb', product: 2.5, transport: 0.4 },
  { month: 'Mar', product: 2.8, transport: 0.4 },
  { month: 'Apr', product: 3.2, transport: 0.5 },
  { month: 'May', product: 3.9, transport: 0.6 },
  { month: 'Jun', product: 4.2, transport: 0.7 },
  { month: 'Jul', product: 4.8, transport: 0.8 },
  { month: 'Aug', product: 4.1, transport: 0.7 },
  { month: 'Sep', product: 4.5, transport: 0.75 },
  { month: 'Oct', product: 4.9, transport: 0.85 },
  { month: 'Nov', product: 5.3, transport: 0.9 },
  { month: 'Dec', product: 5.8, transport: 1.0 },
];
export interface UserItem {
  id: string;
  name: string;
  role: 'farmer' | 'seller' | 'transporter';
  email: string;
  phone: string;
  location: string;
  verified: boolean;
  status: 'active' | 'pending' | 'suspended';
  joined: string;
}

export const mockUsers: UserItem[] = [
  {
    id: '1',
    name: 'Sunil Perera',
    role: 'farmer',
    email: 'sunil@gmail.com',
    phone: '+94 77 123 4567',
    location: 'Nuwara Eliya',
    verified: true,
    status: 'active',
    joined: '2026-01-15',
  },
  {
    id: '2',
    name: 'Kamal Jayasinghe',
    role: 'farmer',
    email: 'kamal@farm.lk',
    phone: '+94 71 234 5678',
    location: 'Dambulla',
    verified: true,
    status: 'active',
    joined: '2026-02-08',
  },
  {
    id: '3',
    name: 'Priya Kumarasinghe',
    role: 'farmer',
    email: 'priya@farm.lk',
    phone: '+94 76 345 6789',
    location: 'Kandy',
    verified: false,
    status: 'pending',
    joined: '2026-07-20',
  },
  {
    id: '4',
    name: 'Amara Wickramasinghe',
    role: 'seller',
    email: 'amara@colombofresh.lk',
    phone: '+94 71 456 7890',
    location: 'Colombo 07',
    verified: true,
    status: 'active',
    joined: '2026-01-20',
  },
  {
    id: '5',
    name: 'Niroshan Silva',
    role: 'seller',
    email: 'niro@kandymart.lk',
    phone: '+94 77 567 8901',
    location: 'Kandy',
    verified: true,
    status: 'active',
    joined: '2026-03-12',
  },
  {
    id: '6',
    name: 'Ruwan Bandara',
    role: 'transporter',
    email: 'ruwan@transport.lk',
    phone: '+94 76 678 9012',
    location: 'Colombo',
    verified: true,
    status: 'active',
    joined: '2026-02-25',
  },
  {
    id: '7',
    name: 'Sisira Gamage',
    role: 'transporter',
    email: 'sisira@logist.lk',
    phone: '+94 71 789 0123',
    location: 'Gampaha',
    verified: false,
    status: 'suspended',
    joined: '2026-06-01',
  },
];

export interface ApprovalItem{
  id: string;
  name: string;
  role: 'farmer'|'seller'|'transporter';
  location: string;
  email: string;
  phone: string;
  docType: string;
  idNumber: string;
  submittedAt: string;
  submittedFull: string;
  status: 'pending' | 'approved' | 'rejected';
  documentImage: string;
}
export const mockApprovals: ApprovalItem[] = [
  {
    id: '1',
    name: 'Priya Kumarasinghe',
    role: 'farmer',
    location: 'Kandy',
    email: 'priya@farm.lk',
    phone: '+94 76 345 6789',
    docType: 'National ID Card',
    idNumber: 'NIC-890432198V',
    submittedAt: '8/28/2026',
    submittedFull: '8/28/2026, 9:14:00 AM',
    status: 'pending',
    documentImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '2',
    name: 'Chathura Senanayake',
    role: 'seller',
    location: 'Galle',
    email: 'chathura@market.lk',
    phone: '+94 71 889 1234',
    docType: 'National ID Card',
    idNumber: 'NIC-940112456V',
    submittedAt: '8/27/2026',
    submittedFull: '8/27/2026, 2:30:00 PM',
    status: 'pending',
    documentImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '3',
    name: 'Kasun Wickramasinghe',
    role: 'transporter',
    location: 'Kurunegala',
    email: 'kasun@express.lk',
    phone: '+94 77 445 9821',
    docType: "Driver's License",
    idNumber: 'DL-B8923419',
    submittedAt: '8/27/2026',
    submittedFull: '8/27/2026, 11:10:00 AM',
    status: 'pending',
    documentImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '4',
    name: 'Sanduni Wickrama',
    role: 'farmer',
    location: 'Nuwara Eliya',
    email: 'sanduni@eco.lk',
    phone: '+94 77 123 9988',
    docType: 'National ID Card',
    idNumber: 'NIC-970821312V',
    submittedAt: '8/26/2026',
    submittedFull: '8/26/2026, 10:05:00 AM',
    status: 'approved',
    documentImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '5',
    name: 'Dilhan Perera',
    role: 'seller',
    location: 'Colombo 05',
    email: 'dilhan@mart.lk',
    phone: '+94 71 556 7788',
    docType: 'National ID Card',
    idNumber: 'NIC-880930711V',
    submittedAt: '8/25/2026',
    submittedFull: '8/25/2026, 4:45:00 PM',
    status: 'rejected',
    documentImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
  },
];
export interface AdminAccount {
  id: string;
  name: string;
  username: string;
  role: 'Super Admin' | 'Admin' | 'Moderator';
  addedDate: string;
  isSuperAdmin: boolean;
}

export const mockAdmins: AdminAccount[] = [
  {
    id: '1',
    name: 'Admin User',
    username: 'admin',
    role: 'Super Admin',
    addedDate: '1/1/2024',
    isSuperAdmin: true,
  },
];
export interface SellingAd {
  id: string;
  title: string;
  postedBy: string;
  category: string;
  price: string;
  quantity: string;
  location: string;
  validUntil: string;
  status: 'active' | 'sold';
  image: string;
}

export interface RequirementAd {
  id: string;
  title: string;
  postedBy: string;
  category: string;
  offeredPrice: string;
  quantityNeeded: string;
  location: string;
  deadline: string;
  description: string;
  responsesCount: number;
  status: 'open' | 'closed';
}

// 8 Selling Ads matching screenshot
export const mockSellingAds: SellingAd[] = [
  {
    id: '1',
    title: 'Fresh Cabbage',
    postedBy: 'Sunil Perera',
    category: 'Vegetables',
    price: 'Rs. 80/kg',
    quantity: '500 kg available',
    location: 'Nuwara Eliya',
    validUntil: 'Until 2026-09-15',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '2',
    title: 'Organic Carrots',
    postedBy: 'Sunil Perera',
    category: 'Vegetables',
    price: 'Rs. 120/kg',
    quantity: '300 kg available',
    location: 'Nuwara Eliya',
    validUntil: 'Until 2026-09-20',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '3',
    title: 'Red Onions',
    postedBy: 'Kamal Jayasinghe',
    category: 'Vegetables',
    price: 'Rs. 150/kg',
    quantity: '1000 kg available',
    location: 'Dambulla',
    validUntil: 'Until 2026-10-01',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '4',
    title: 'Green Beans',
    postedBy: 'Priya Kumarasinghe',
    category: 'Vegetables',
    price: 'Rs. 180/kg',
    quantity: '200 kg available',
    location: 'Kandy',
    validUntil: 'Until 2026-09-10',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '5',
    title: 'Ripe Bananas (Ambul)',
    postedBy: 'Sunil Perera',
    category: 'Fruits',
    price: 'Rs. 140/kg',
    quantity: '400 kg available',
    location: 'Kurunegala',
    validUntil: 'Until 2026-09-18',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '6',
    title: 'Fresh Potatoes',
    postedBy: 'Kamal Jayasinghe',
    category: 'Vegetables',
    price: 'Rs. 220/kg',
    quantity: '800 kg available',
    location: 'Badulla',
    validUntil: 'Until 2026-09-28',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '7',
    title: 'Green Papaya',
    postedBy: 'Sanduni Wickrama',
    category: 'Fruits',
    price: 'Rs. 90/kg',
    quantity: '350 kg available',
    location: 'Anuradhapura',
    validUntil: 'Until 2026-09-22',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '8',
    title: 'Fresh Ginger',
    postedBy: 'Sunil Perera',
    category: 'Spices',
    price: 'Rs. 450/kg',
    quantity: '150 kg available',
    location: 'Gampaha',
    validUntil: 'Until 2026-10-15',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&q=80',
  },
];

// 3 Requirement Ads matching screenshot
export const mockRequirementAds: RequirementAd[] = [
  {
    id: '1',
    title: 'Fresh Cabbage',
    postedBy: 'Colombo Fresh Market',
    category: 'Vegetables',
    offeredPrice: 'Rs. 85/kg offered',
    quantityNeeded: '100 kg needed',
    location: 'Colombo 07',
    deadline: 'By 2026-09-01',
    description: 'Need fresh cabbage weekly. Quality grade A preferred.',
    responsesCount: 3,
    status: 'open',
  },
  {
    id: '2',
    title: 'Red Onions',
    postedBy: 'Kandy Supermart',
    category: 'Vegetables',
    offeredPrice: 'Rs. 145/kg offered',
    quantityNeeded: '250 kg needed',
    location: 'Kandy City',
    deadline: 'By 2026-09-05',
    description: 'Bulk red onions for supermarket. Regular supply needed.',
    responsesCount: 5,
    status: 'open',
  },
  {
    id: '3',
    title: 'Ripe Tomatoes',
    postedBy: 'Colombo Fresh Market',
    category: 'Vegetables',
    offeredPrice: 'Rs. 160/kg offered',
    quantityNeeded: '180 kg needed',
    location: 'Colombo 07',
    deadline: 'By 2026-09-08',
    description: 'Fresh salad tomatoes required for immediate retail delivery.',
    responsesCount: 4,
    status: 'open',
  },
];

export interface OperationItem {
  id: string;
  code: string;
  type: 'product' | 'order' | 'transport';
  title: string;
  category?: string;
  quantity?: string;
  rate?: string;
  owner?: string;
  route?: string;
  pickupDrop?: string;
  schedule?: string;
  amount?: string;
  status: 'Active' | 'Open' | 'In Transit' | 'Completed' | 'Payment Held';
  date: string;
}

export const mockOperations: OperationItem[] = [
  // Orders (3)
  {
    id: 'o1',
    code: 'GH-2050',
    type: 'order',
    title: 'Ripe Tomatoes',
    route: 'Kamal Jayasinghe → Colombo Fresh Market · 150 kg',
    pickupDrop: 'Dambulla → Colombo 03',
    amount: 'Rs. 15,500',
    status: 'Payment Held',
    date: '2026-08-28',
  },
  {
    id: 'o2',
    code: 'GH-2041',
    type: 'order',
    title: 'Fresh Cabbage',
    route: 'Sunil Perera → Colombo Fresh Market · 100 kg',
    pickupDrop: 'Nuwara Eliya → Colombo 07',
    amount: 'Rs. 9,500',
    status: 'In Transit',
    date: '2026-08-25',
  },
  {
    id: 'o3',
    code: 'GH-2035',
    type: 'order',
    title: 'Red Onions',
    route: 'Kamal Jayasinghe → Kandy Supermart · 250 kg',
    pickupDrop: 'Dambulla → Kandy',
    amount: 'Rs. 37,500',
    status: 'Completed',
    date: '2026-08-18',
  },

  // Transport (3)
  {
    id: 't1',
    code: 'GH-T1025',
    type: 'transport',
    title: 'Ripe Tomatoes',
    pickupDrop: 'Dambulla Agricultural Zone → Colombo Fresh Market',
    schedule: 'Kamal Jayasinghe · 2026-08-31 06:00 AM',
    status: 'Open',
    date: '2026-08-28',
  },
  {
    id: 't2',
    code: 'GH-T1020',
    type: 'transport',
    title: 'Organic Carrots',
    pickupDrop: 'Nuwara Eliya Highlands Farm → Kandy Supermart',
    schedule: 'Sunil Perera · 2026-08-29 07:00 AM',
    status: 'Open',
    date: '2026-08-27',
  },
  {
    id: 't3',
    code: 'GH-T1024',
    type: 'transport',
    title: 'Fresh Cabbage',
    pickupDrop: 'Nuwara Eliya Farm → Colombo Fresh Market',
    schedule: 'Sunil Perera · 2026-08-30 08:00 AM',
    amount: 'Rs. 1,500',
    status: 'Active',
    date: '2026-08-25',
  },

  // Products (8)
  {
    id: 'p1',
    code: 'p4',
    type: 'product',
    title: 'Green Beans',
    category: 'Vegetables',
    quantity: '200 kg',
    rate: 'Rs. 180/kg',
    owner: 'Priya Kumarasinghe',
    amount: 'Rs. 36,000',
    status: 'Active',
    date: '2026-08-22',
  },
  {
    id: 'p2',
    code: 'p5',
    type: 'product',
    title: 'Ripe Tomatoes',
    category: 'Vegetables',
    quantity: '400 kg',
    rate: 'Rs. 90/kg',
    owner: 'Kamal Jayasinghe',
    amount: 'Rs. 36,000',
    status: 'Active',
    date: '2026-08-21',
  },
  {
    id: 'p3',
    code: 'p1',
    type: 'product',
    title: 'Fresh Cabbage',
    category: 'Vegetables',
    quantity: '500 kg',
    rate: 'Rs. 80/kg',
    owner: 'Sunil Perera',
    amount: 'Rs. 40,000',
    status: 'Active',
    date: '2026-08-20',
  },
  {
    id: 'p4',
    code: 'p2',
    type: 'product',
    title: 'Organic Carrots',
    category: 'Vegetables',
    quantity: '300 kg',
    rate: 'Rs. 120/kg',
    owner: 'Sunil Perera',
    amount: 'Rs. 36,000',
    status: 'Active',
    date: '2026-08-19',
  },
  {
    id: 'p5',
    code: 'p3',
    type: 'product',
    title: 'Red Onions',
    category: 'Vegetables',
    quantity: '1000 kg',
    rate: 'Rs. 150/kg',
    owner: 'Kamal Jayasinghe',
    amount: 'Rs. 150,000',
    status: 'Active',
    date: '2026-08-18',
  },
  {
    id: 'p6',
    code: 'p6',
    type: 'product',
    title: 'Ambul Bananas',
    category: 'Fruits',
    quantity: '450 kg',
    rate: 'Rs. 140/kg',
    owner: 'Sunil Perera',
    amount: 'Rs. 63,000',
    status: 'Active',
    date: '2026-08-17',
  },
  {
    id: 'p7',
    code: 'p7',
    type: 'product',
    title: 'Fresh Potatoes',
    category: 'Vegetables',
    quantity: '600 kg',
    rate: 'Rs. 220/kg',
    owner: 'Kamal Jayasinghe',
    amount: 'Rs. 132,000',
    status: 'Active',
    date: '2026-08-16',
  },
  {
    id: 'p8',
    code: 'p8',
    type: 'product',
    title: 'Green Papaya',
    category: 'Fruits',
    quantity: '350 kg',
    rate: 'Rs. 90/kg',
    owner: 'Sanduni Wickrama',
    amount: 'Rs. 31,500',
    status: 'Active',
    date: '2026-08-15',
  },
];
