import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, spacing, fontSize } from '../theme';
import { getBranches } from '../services/api';
import { Branch } from '../types';

const ICONS: Record<string, string> = {
  'main-battle-tanks': '🛡️',
  'armored-recon': '🔭',
  'armored-maintenance': '🔧',
  'armor-transport': '🚛',
  'command-control': '📡',
};

function getIcon(slug: string): string {
  return ICONS[slug] || '📖';
}

interface Props {
  onSelectBranch: (branch: Branch) => void;
}

export default function DashboardScreen({ onSelectBranch }: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBranches = async () => {
    try {
      const res = await getBranches('armor');
      setBranches(res.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBranches();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.flag}>🇲🇦</Text>
        <Text style={styles.title}>سلاح المدرعات</Text>
        <Text style={styles.subtitle}>منصة التدريب الإلكتروني</Text>
      </View>

      <FlatList
        data={branches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onSelectBranch(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>{getIcon(item.slug)}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  flag: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  list: {
    padding: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  arrow: {
    fontSize: 20,
    color: colors.textDark,
    marginLeft: spacing.sm,
  },
});
