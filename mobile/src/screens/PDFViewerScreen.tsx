import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { colors, spacing, fontSize } from '../theme';
import { saveProgress, getLessonFileUrl } from '../services/api';
import { Lesson } from '../types';

interface Props {
  lesson: Lesson;
  onBack: () => void;
}

export default function PDFViewerScreen({ lesson, onBack }: Props) {
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    lesson.userProgress?.lastPage || 1
  );
  const [totalPages, setTotalPages] = useState(
    lesson.userProgress?.totalPages || 0
  );
  const [zoom, setZoom] = useState(1);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    loadPdf();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const loadPdf = async () => {
    try {
      const res = await getLessonFileUrl(lesson.id);
      setPdfUri(res.data.url);
    } catch {
      Alert.alert('خطأ', 'فشل تحميل الملف');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSave = useCallback(
    (page: number, total: number) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveProgress(lesson.id, {
          lastPage: page,
          totalPages: total,
          completed: page === total,
        }).catch(() => {});
      }, 3000);
    },
    [lesson.id]
  );

  const handlePageChanged = (page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
    if (total > 0) {
      debouncedSave(page, total);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onBack} style={styles.toolBtn}>
          <Text style={styles.toolBtnText}>→ رجوع</Text>
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <Text style={styles.pageText}>
            {currentPage} / {totalPages || '...'}
          </Text>
        </View>

        <View style={styles.zoomControls}>
          <TouchableOpacity
            onPress={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            style={styles.zoomBtn}
          >
            <Text style={styles.zoomBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
          <TouchableOpacity
            onPress={() => setZoom((z) => Math.min(z + 0.25, 3))}
            style={styles.zoomBtn}
          >
            <Text style={styles.zoomBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>جاري تحميل الدرس...</Text>
        </View>
      ) : pdfUri ? (
        <Pdf
          source={{ uri: pdfUri, cache: true }}
          style={styles.pdf}
          onLoadComplete={(numberOfPages) => {
            setTotalPages(numberOfPages);
          }}
          onPageChanged={(page) =>
            handlePageChanged(page, totalPages || 0)
          }
          onError={() => {
            Alert.alert('خطأ', 'فشل عرض الملف');
          }}
          scale={zoom}
          minScale={0.5}
          maxScale={3}
          spacing={10}
          enablePaging
          horizontal={false}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.errorText}>لا يمكن تحميل الملف</Text>
        </View>
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  toolBtn: {
    padding: spacing.sm,
  },
  toolBtnText: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  zoomBtnText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  zoomText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginHorizontal: spacing.sm,
    minWidth: 36,
    textAlign: 'center',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: spacing.md,
    fontSize: fontSize.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.md,
  },
});
