import { Users, ShoppingBag, CreditCard, Truck } from 'lucide-react';
import StatCard from '../components/dashbord/StatCard';
import { mockStats, mockRoleCounts} from '../data/mockData';
import RoleCard from '../components/dashbord/RoleCard';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Overview Stat Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={mockStats.totalUsers}
          subtext={mockStats.usersThisMonth}
          icon={Users}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Active Orders"
          value={mockStats.activeOrders}
          subtext="Current active market orders"
          icon={ShoppingBag}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Held Payments"
          value={mockStats.heldPayments}
          subtext="In secure escrow"
          icon={CreditCard}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Transport Jobs"
          value={mockStats.transportJobs}
          subtext="Active transport deliveries"
          icon={Truck}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </section>

      {/* Role Breakdown Cards */}
<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <RoleCard
    count={mockRoleCounts.farmers}
    label="Farmers"
    emoji="🌱"
    theme="emerald"
  />
  <RoleCard
    count={mockRoleCounts.sellers}
    label="Sellers"
    emoji="🎁"
    theme="blue"
  />
  <RoleCard
    count={mockRoleCounts.transporters}
    label="Transporters"
    emoji="🚚"
    theme="amber"
  />
</section>

    </div>
  );
}
