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


export const mockUserGrowth = [
  { month: 'Mar', farmers: 420, sellers: 280, transporters: 140 },
  { month: 'Apr', farmers: 460, sellers: 310, transporters: 160 },
  { month: 'May', farmers: 500, sellers: 350, transporters: 180 },
  { month: 'Jun', farmers: 550, sellers: 380, transporters: 200 },
  { month: 'Jul', farmers: 590, sellers: 400, transporters: 220 },
  { month: 'Aug', farmers: 632, sellers: 418, transporters: 234 },
];

export const mockTransactionVolume = [
  { month: 'Mar', product: 2.8, transport: 0.4 },
  { month: 'Apr', product: 3.2, transport: 0.5 },
  { month: 'May', product: 3.9, transport: 0.6 },
  { month: 'Jun', product: 4.2, transport: 0.7 },
  { month: 'Jul', product: 4.8, transport: 0.8 },
  { month: 'Aug', product: 4.1, transport: 0.7 },
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
