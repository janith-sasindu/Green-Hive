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
