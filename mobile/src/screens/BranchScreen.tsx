import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, fontSize } from '../theme';
import { getLessons } from '../services/api';
import { Lesson, Branch } from '../types';

interface Props {
  branch: Branch;
  onSelectLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

export default function BranchScreen({
  branch,
  onSelectLesson,
  onBack,
}: Props) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const res = await getLessons('armor', branch.id);
      setLessons(res.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
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
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>→ رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{branch.name}</Text>
      </View>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>لا توجد دروس</Text>
        }
        renderItem={({ item: lesson, index }) => {
          const prog = lesson.userProgress;
          return (
            <TouchableOpacity
              style={styles.lessonItem}
              onPress={() => onSelectLesson(lesson)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.numberBadge,
                  prog?.completed && styles.completedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.numberText,
                    prog?.completed && styles.completedNumber,
                  ]}
                >
                  {prog?.completed ? '✓' : index + 1}
                </Text>
              </View>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                {lesson.description && (
                  <Text style={styles.lessonDesc} numberOfLines={1}>
                    {lesson.description}
                  </Text>
                )}
              </View>
              <View style={styles.lessonMeta}>
                {prog?.completed ? (
                  <Text style={styles.completedText}>مكتمل</Text>
                ) : prog?.lastPage ? (
                  <Text style={styles.progressText}>
                    {prog.lastPage}/{prog.totalPages}
                  </Text>
                ) : (
                  <Text style={styles.newText}>جديد</Text>
                )}
                <Text style={styles.arrow}>‹</Text>
              </View>
            </TouchableOpacity>
          );
        }}
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    marginLeft: spacing.md,
  },
  backText: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.accent,
    flex: 1,
    textAlign: 'right',
  },
  list: {
    padding: spacing.md,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  completedBadge: {
    backgroundColor: '#14532d',
  },
  numberText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  completedNumber: {
    color: colors.success,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'right',
  },
  lessonDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  completedText: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  newText: {
    fontSize: fontSize.xs,
    color: colors.textDark,
    marginRight: spacing.sm,
  },
  arrow: {
    fontSize: 20,
    color: colors.textDark,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textDark,
    padding: spacing.xl,
    fontSize: fontSize.md,
  },
});
