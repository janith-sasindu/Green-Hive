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
