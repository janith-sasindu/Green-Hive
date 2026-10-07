import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/seller/AppHeader';
import { useSellerTheme } from '../../components/seller/theme';
import { Card, EmptyState, RouteSummary, Screen, StatusBadge, ink } from '../../components/seller/ui';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { SellerTransportJob } from '../../types/seller';
import { formatKg } from '../../utils/format';
import { TRANSPORT_JOB_STATUS } from '../../utils/sellerStatus';
import { getAssignedTransporterName } from '../../utils/sellerWorkflow';

const getOfferSummary = (job: SellerTransportJob): { text: string; highlighted: boolean } => {
  if (job.status !== 'OPEN_FOR_BIDS') {
    return { text: getAssignedTransporterName(job) ?? 'Transporter assigned', highlighted: true };
  }
  const pending = job.offers.filter((offer) => offer.status === 'PENDING').length;
  return pending > 0
    ? { text: `${pending} ${pending === 1 ? 'offer' : 'offers'} →`, highlighted: true }
    : { text: 'Awaiting offers', highlighted: false };
};

const TransportJobCard = ({ job, onPress }: { job: SellerTransportJob; onPress: () => void }) => {
  const theme = useSellerTheme();
  const summary = getOfferSummary(job);

  return (
    <Card onPress={onPress} className="p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className={`text-xs ${ink.faint}`}>#{job.jobNumber}</Text>
          <Text className={`text-base font-bold ${ink.strong}`} numberOfLines={1}>
            {job.productName} · {formatKg(job.quantityKg)}
          </Text>
        </View>
        <StatusBadge {...TRANSPORT_JOB_STATUS[job.status]} showDot={false} />
      </View>
      <View className="mt-3">
        <RouteSummary pickup={job.pickupLocation} delivery={job.deliveryLocation} />
      </View>
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="clock" size={13} color={theme.iconMuted} />
          <Text className={`ml-1.5 text-xs ${ink.faint}`}>
            {job.requiredDate} · {job.requiredTime}
          </Text>
        </View>
        <Text className={`text-xs font-semibold ${summary.highlighted ? ink.accent : ink.faint}`}>
          {summary.text}
        </Text>
      </View>
    </Card>
  );
};

export const TransportScreen = () => {
  const navigation = useSellerNavigation();
  const { transportJobs } = useSeller();

  return (
    <Screen>
      <AppHeader title="Transportation" />
      <FlatList
        data={transportJobs}
        keyExtractor={(job) => String(job.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className={`text-sm ${ink.muted}`}>
            Manage transport jobs for your orders that require delivery.
          </Text>
        }
        renderItem={({ item }) => (
          <TransportJobCard
            job={item}
            onPress={() => navigation.navigate('TransportJobDetail', { jobId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="🚛"
            title="No transport jobs"
            message="Choose “Transportation Required” when placing an order and transporters will send you their costs."
          />
        }
      />
    </Screen>
  );
};
