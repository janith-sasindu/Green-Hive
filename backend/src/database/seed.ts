import bcrypt from 'bcryptjs';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Db, withTransaction } from '../config/db';

/**
 * Demo data for development: one retail seller, the farmers and transporters they trade
 * with, and orders at different stages of the payment workflow. It mirrors the sample data
 * the mobile app shows, so the same screens can be driven by the API.
 */

export const DEMO_SELLER_EMAIL = 'amara@greenhive.test';

const BCRYPT_ROUNDS = 10;

const photo = (id: string): string => `https://images.unsplash.com/photo-${id}?w=600&q=70&auto=format&fit=crop`;

const insert = async (db: Db, sql: string, values: unknown[]): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(sql, values);
  return result.insertId;
};

interface DemoUser {
  name: string;
  email: string;
  phone: string;
  role: 'FARMER' | 'SELLER' | 'TRANSPORTER';
  location: string;
  isVerified: boolean;
  rating: number;
}

const createUser = (db: Db, passwordHash: string, user: DemoUser): Promise<number> =>
  insert(
    db,
    `INSERT INTO users (name, email, phone, password_hash, role, location, is_verified, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.name, user.email, user.phone, passwordHash, user.role, user.location, user.isVerified, user.rating],
  );

const createFarmer = async (
  db: Db,
  passwordHash: string,
  farmer: Omit<DemoUser, 'role'> & { farmAddress: string },
): Promise<number> => {
  const id = await createUser(db, passwordHash, { ...farmer, role: 'FARMER' });
  await insert(db, 'INSERT INTO farmer_profiles (user_id, farm_address) VALUES (?, ?)', [id, farmer.farmAddress]);
  return id;
};

const createTransporter = async (
  db: Db,
  passwordHash: string,
  transporter: Omit<DemoUser, 'role'> & { vehicleType: string },
): Promise<number> => {
  const id = await createUser(db, passwordHash, { ...transporter, role: 'TRANSPORTER' });
  await insert(db, 'INSERT INTO transporter_profiles (user_id, vehicle_type) VALUES (?, ?)', [
    id,
    transporter.vehicleType,
  ]);
  return id;
};

interface DemoAdvertisement {
  farmerId: number;
  productName: string;
  category: string;
  quantityKg: number;
  pricePerKg: number;
  location: string;
  description: string;
  imageUrl: string | null;
  /** Days from today until the advertisement ends. */
  availableForDays: number;
}

const createAdvertisement = (db: Db, ad: DemoAdvertisement): Promise<number> =>
  insert(
    db,
    `INSERT INTO advertisements
       (farmer_id, product_name, category, quantity_available_kg, unit_price_lkr, location, description, image_url,
        availability_start_date, availability_end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE() - INTERVAL 3 DAY, CURDATE() + INTERVAL ? DAY)`,
    [
      ad.farmerId,
      ad.productName,
      ad.category,
      ad.quantityKg,
      ad.pricePerKg,
      ad.location,
      ad.description,
      ad.imageUrl,
      ad.availableForDays,
    ],
  );

interface DemoOrder {
  sellerId: number;
  farmerId: number;
  advertisementId: number;
  productName: string;
  imageUrl: string | null;
  quantityKg: number;
  pricePerKg: number;
  pickupAddress: string;
  status: 'PAYMENT_HELD' | 'PICKED_UP';
  productPaymentStatus: 'HELD' | 'RELEASED';
  daysAgo: number;
}

/** Creates a transported order with its product payment and returns the order id. */
const createTransportedOrder = async (db: Db, order: DemoOrder): Promise<number> => {
  const total = order.quantityKg * order.pricePerKg;
  const id = await insert(
    db,
    `INSERT INTO orders
       (seller_id, farmer_id, advertisement_id, product_name, image_url, quantity_kg, product_price_per_kg,
        total_product_amount, delivery_method, pickup_address, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'TRANSPORTATION', ?, ?, NOW() - INTERVAL ? DAY)`,
    [
      order.sellerId,
      order.farmerId,
      order.advertisementId,
      order.productName,
      order.imageUrl,
      order.quantityKg,
      order.pricePerKg,
      total,
      order.pickupAddress,
      order.status,
      order.daysAgo,
    ],
  );
  await db.query('UPDATE orders SET order_number = ? WHERE id = ?', [`GH-${2000 + id}`, id]);
  await insert(
    db,
    `INSERT INTO payments (order_id, payment_type, payer_id, payee_id, amount, status, released_at)
     VALUES (?, 'PRODUCT', ?, ?, ?, ?, ?)`,
    [
      id,
      order.sellerId,
      order.farmerId,
      total,
      order.productPaymentStatus,
      order.productPaymentStatus === 'RELEASED' ? new Date() : null,
    ],
  );
  return id;
};

interface DemoJob {
  orderId: number;
  pickupLocation: string;
  deliveryLocation: string;
  quantityKg: number;
  /** Days from today the delivery is needed. */
  requiredInDays: number;
  requiredTime: string;
}

const createJob = async (db: Db, job: DemoJob): Promise<number> => {
  const id = await insert(
    db,
    `INSERT INTO transportation_jobs
       (order_id, pickup_location, delivery_location, quantity_kg, required_date, required_time)
     VALUES (?, ?, ?, ?, CURDATE() + INTERVAL ? DAY, ?)`,
    [job.orderId, job.pickupLocation, job.deliveryLocation, job.quantityKg, job.requiredInDays, job.requiredTime],
  );
  await db.query('UPDATE transportation_jobs SET job_number = ? WHERE id = ?', [`GH-T${1000 + id}`, id]);
  return id;
};

const createOffer = (
  db: Db,
  jobId: number,
  transporterId: number,
  cost: number,
  estimate: string,
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED',
): Promise<number> =>
  insert(
    db,
    `INSERT INTO transportation_offers (job_id, transporter_id, proposed_cost, estimated_delivery_time, status)
     VALUES (?, ?, ?, ?, ?)`,
    [jobId, transporterId, cost, estimate, status],
  );

/**
 * Fills an empty database with the demo data. Every demo account gets the given password.
 * Refuses to run when users already exist, so real data is never mixed with demo data.
 */
export async function seedDemoData(password: string): Promise<void> {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await withTransaction(async (db) => {
    const [existing] = await db.query<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM users');
    if (existing[0].total > 0) {
      throw new Error('The database already has users. Demo data is only added to an empty database.');
    }

    // --- People ---------------------------------------------------------------------------
    const sellerId = await createUser(db, passwordHash, {
      name: 'Amara Wickramasinghe',
      email: DEMO_SELLER_EMAIL,
      phone: '+94 71 234 5678',
      role: 'SELLER',
      location: 'Colombo 07',
      isVerified: true,
      rating: 4.9,
    });
    await insert(db, 'INSERT INTO seller_profiles (user_id, business_name, address) VALUES (?, ?, ?)', [
      sellerId,
      'Colombo Fresh Market',
      'Colombo Fresh Market, Colombo 07',
    ]);
    await insert(db, 'INSERT INTO notification_settings (user_id) VALUES (?)', [sellerId]);

    const nuwaraEliyaFarm = 'Nuwara Eliya Farm, Hanguranketha Road';
    const dambullaFarm = 'Dambulla Agricultural Zone, Plot 14';

    const sunil = await createFarmer(db, passwordHash, {
      name: 'Sunil Perera',
      email: 'sunil@greenhive.test',
      phone: '+94 77 100 2001',
      location: 'Nuwara Eliya',
      isVerified: true,
      rating: 4.8,
      farmAddress: nuwaraEliyaFarm,
    });
    const kamal = await createFarmer(db, passwordHash, {
      name: 'Kamal Jayasinghe',
      email: 'kamal@greenhive.test',
      phone: '+94 77 100 2002',
      location: 'Dambulla',
      isVerified: true,
      rating: 4.6,
      farmAddress: dambullaFarm,
    });
    const priya = await createFarmer(db, passwordHash, {
      name: 'Priya Kumarasinghe',
      email: 'priya@greenhive.test',
      phone: '+94 77 100 2003',
      location: 'Kandy',
      isVerified: false,
      rating: 4.3,
      farmAddress: 'Kumarasinghe Estate, Peradeniya Road, Kandy',
    });
    const nimal = await createFarmer(db, passwordHash, {
      name: 'Nimal Fernando',
      email: 'nimal@greenhive.test',
      phone: '+94 77 100 2004',
      location: 'Matale',
      isVerified: true,
      rating: 4.5,
      farmAddress: 'Fernando Plantation, Rattota Road, Matale',
    });
    const chamara = await createFarmer(db, passwordHash, {
      name: 'Chamara Dissanayake',
      email: 'chamara@greenhive.test',
      phone: '+94 77 100 2005',
      location: 'Polonnaruwa',
      isVerified: true,
      rating: 4.7,
      farmAddress: 'Dissanayake Rice Mill, Hingurakgoda Road, Polonnaruwa',
    });

    const ruwan = await createTransporter(db, passwordHash, {
      name: 'Ruwan Transport',
      email: 'ruwan@greenhive.test',
      phone: '+94 76 300 4001',
      location: 'Kandy',
      isVerified: true,
      rating: 4.7,
      vehicleType: 'Isuzu Elf · 2 ton lorry',
    });
    const lanka = await createTransporter(db, passwordHash, {
      name: 'Lanka Express Logistics',
      email: 'lanka@greenhive.test',
      phone: '+94 76 300 4002',
      location: 'Colombo',
      isVerified: true,
      rating: 4.4,
      vehicleType: 'Tata Ace · 1 ton',
    });

    // --- Farmer advertisements --------------------------------------------------------------
    const cabbageImage = photo('1594282486552-05b4d80fbb9f');
    const tomatoImage = photo('1592924357228-91a4daadcfea');

    const cabbageId = await createAdvertisement(db, {
      farmerId: sunil,
      productName: 'Fresh Cabbage',
      category: 'Vegetables',
      quantityKg: 500,
      pricePerKg: 80,
      location: 'Nuwara Eliya',
      description: 'Firm, freshly harvested upcountry cabbage. Harvested to order and packed in 25 kg net bags.',
      imageUrl: cabbageImage,
      availableForDays: 10,
    });
    await createAdvertisement(db, {
      farmerId: sunil,
      productName: 'Organic Carrots',
      category: 'Vegetables',
      quantityKg: 300,
      pricePerKg: 120,
      location: 'Nuwara Eliya',
      description: 'Organically grown carrots, washed and graded. No chemical fertiliser or pesticide used.',
      imageUrl: photo('1598170845058-32b9d6a5da37'),
      availableForDays: 12,
    });
    await createAdvertisement(db, {
      farmerId: kamal,
      productName: 'Red Onions',
      category: 'Vegetables',
      quantityKg: 1000,
      pricePerKg: 150,
      location: 'Dambulla',
      description: 'Well cured red onions with long shelf life. Available in 50 kg mesh sacks.',
      imageUrl: photo('1618512496248-a07fe83aa8cb'),
      availableForDays: 21,
    });
    await createAdvertisement(db, {
      farmerId: priya,
      productName: 'Green Beans',
      category: 'Vegetables',
      quantityKg: 200,
      pricePerKg: 180,
      location: 'Kandy',
      description: 'Tender green beans picked every morning. Best collected within two days of ordering.',
      imageUrl: photo('1567375698348-5d9d5ae99de0'),
      availableForDays: 7,
    });
    const tomatoId = await createAdvertisement(db, {
      farmerId: kamal,
      productName: 'Ripe Tomatoes',
      category: 'Vegetables',
      quantityKg: 400,
      pricePerKg: 90,
      location: 'Dambulla',
      description: 'Vine ripened tomatoes, sorted by size and packed in plastic crates to avoid bruising.',
      imageUrl: tomatoImage,
      availableForDays: 8,
    });
    await createAdvertisement(db, {
      farmerId: sunil,
      productName: 'Leeks',
      category: 'Vegetables',
      quantityKg: 150,
      pricePerKg: 200,
      location: 'Nuwara Eliya',
      description: 'Long white-stem leeks, trimmed and bundled in 5 kg bunches.',
      imageUrl: null,
      availableForDays: 9,
    });
    await createAdvertisement(db, {
      farmerId: nimal,
      productName: 'Banana Bunch',
      category: 'Fruits',
      quantityKg: 800,
      pricePerKg: 60,
      location: 'Matale',
      description: 'Ambul and Kolikuttu bananas sold by the bunch, harvested mature-green for retail ripening.',
      imageUrl: photo('1603833665858-e61d17a86224'),
      availableForDays: 14,
    });
    await createAdvertisement(db, {
      farmerId: chamara,
      productName: 'Basmati Rice',
      category: 'Grains & Rice',
      quantityKg: 2000,
      pricePerKg: 210,
      location: 'Polonnaruwa',
      description: 'Long grain rice from the latest Maha season, milled and packed in 25 kg bags.',
      imageUrl: photo('1586201375761-83865001e31c'),
      availableForDays: 45,
    });

    // --- Order in transit: farmer paid at pickup, transporter's payment still held ----------
    const cabbageOrderId = await createTransportedOrder(db, {
      sellerId,
      farmerId: sunil,
      advertisementId: cabbageId,
      productName: 'Fresh Cabbage',
      imageUrl: cabbageImage,
      quantityKg: 100,
      pricePerKg: 80,
      pickupAddress: nuwaraEliyaFarm,
      status: 'PICKED_UP',
      productPaymentStatus: 'RELEASED',
      daysAgo: 2,
    });
    const cabbageJobId = await createJob(db, {
      orderId: cabbageOrderId,
      pickupLocation: nuwaraEliyaFarm,
      deliveryLocation: 'Colombo Fresh Market, Colombo 07',
      quantityKg: 100,
      requiredInDays: 0,
      requiredTime: '08:00',
    });
    await createOffer(db, cabbageJobId, ruwan, 1500, '5 hours', 'ACCEPTED');
    await createOffer(db, cabbageJobId, lanka, 1800, '6 hours', 'REJECTED');
    await db.query(
      `UPDATE transportation_jobs
          SET status = 'GOODS_PICKED_UP', assigned_transporter_id = ?, agreed_transport_cost = 1500
        WHERE id = ?`,
      [ruwan, cabbageJobId],
    );
    await insert(
      db,
      `INSERT INTO payments (order_id, payment_type, payer_id, payee_id, amount, status)
       VALUES (?, 'TRANSPORTATION', ?, ?, 1500, 'HELD')`,
      [cabbageOrderId, sellerId, ruwan],
    );

    // --- Order waiting for the seller to choose a transporter -------------------------------
    const tomatoOrderId = await createTransportedOrder(db, {
      sellerId,
      farmerId: kamal,
      advertisementId: tomatoId,
      productName: 'Ripe Tomatoes',
      imageUrl: tomatoImage,
      quantityKg: 150,
      pricePerKg: 90,
      pickupAddress: dambullaFarm,
      status: 'PAYMENT_HELD',
      productPaymentStatus: 'HELD',
      daysAgo: 1,
    });
    const tomatoJobId = await createJob(db, {
      orderId: tomatoOrderId,
      pickupLocation: dambullaFarm,
      deliveryLocation: 'Colombo Fresh Market, Colombo 03',
      quantityKg: 150,
      requiredInDays: 1,
      requiredTime: '06:00',
    });
    await createOffer(db, tomatoJobId, ruwan, 2000, '4 hours', 'PENDING');
    await createOffer(db, tomatoJobId, lanka, 2400, '3.5 hours', 'PENDING');

    // --- Requirements: one with farmer responses to review, one still waiting ---------------
    const carrotRequirementId = await insert(
      db,
      `INSERT INTO requirements
         (seller_id, product_name, category, quantity_needed_kg, max_budget_per_kg, delivery_location, description,
          deadline_date)
       VALUES (?, 'Carrots', 'Vegetables', 200, 110, 'Colombo Fresh Market, Colombo 07',
               'Medium sized, washed carrots for weekend retail stock. Grade A preferred.',
               CURDATE() + INTERVAL 7 DAY)`,
      [sellerId],
    );
    await insert(
      db,
      `INSERT INTO fulfillment_requests (requirement_id, farmer_id, offered_quantity_kg, offered_price_per_kg, notes)
       VALUES (?, ?, 200, 105, 'Can supply the full quantity. Harvest is ready within two days.')`,
      [carrotRequirementId, sunil],
    );
    await insert(
      db,
      `INSERT INTO fulfillment_requests (requirement_id, farmer_id, offered_quantity_kg, offered_price_per_kg, notes)
       VALUES (?, ?, 150, 98, 'I have 150 kg available this week at a lower price.')`,
      [carrotRequirementId, priya],
    );
    await insert(
      db,
      `INSERT INTO requirements
         (seller_id, product_name, category, quantity_needed_kg, max_budget_per_kg, delivery_location, description,
          deadline_date)
       VALUES (?, 'Green Chillies', 'Spices', 50, 250, 'Colombo Fresh Market, Colombo 07',
               'Fresh green chillies, medium heat. Weekly supply considered for the right farmer.',
               CURDATE() + INTERVAL 10 DAY)`,
      [sellerId],
    );

    // --- Seller notifications: one unread ----------------------------------------------------
    const notifications: [string, string, string, string, number, boolean][] = [
      [
        'payments',
        'Product Payment Released',
        `Rs. 8,000 was released to Sunil Perera after pickup of Order #GH-${2000 + cabbageOrderId}.`,
        'ORDER',
        cabbageOrderId,
        true,
      ],
      [
        'fulfillment',
        'Fulfillment Request Received',
        'Sunil Perera offered 200 kg of Carrots at Rs. 105/kg for your requirement.',
        'REQUIREMENT',
        carrotRequirementId,
        true,
      ],
      [
        'transportation',
        'Transportation Offer Received',
        `Ruwan Transport submitted an offer of Rs. 2,000 for Job #GH-T${1000 + tomatoJobId}.`,
        'TRANSPORT_JOB',
        tomatoJobId,
        false,
      ],
    ];
    for (const [category, title, message, linkType, linkId, isRead] of notifications) {
      await insert(
        db,
        `INSERT INTO notifications (user_id, category, title, message, link_type, link_id, is_read)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sellerId, category, title, message, linkType, linkId, isRead],
      );
    }
  });
}
