import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../config/theme';

const DataGrid = ({ data, columns }) => {
  // HOOK 1: useState (Must always be first now)
  const [containerWidth, setContainerWidth] = useState(0);

  // HOOK 2: useMemo (Effective Columns)
  const effectiveColumns = useMemo(() => {
    if (containerWidth === 0) return columns;

    const totalFixedColumnWidth = columns.reduce((sum, col) => sum + (col.width || 100), 0);

    if (totalFixedColumnWidth < containerWidth) {
      const scaleFactor = containerWidth / totalFixedColumnWidth;
      return columns.map(col => ({
        ...col,
        width: Math.floor((col.width || 100) * scaleFactor) - 1
      }));
    }

    return columns;
  }, [columns, containerWidth]);

  // HOOK 3: useMemo (Totals)
  const totals = useMemo(() => {
    const sums = {};
    columns.forEach(col => {
      if (col.total) {
        sums[col.key] = data.reduce((acc, curr) => {
          const cleanVal = curr[col.key] ? curr[col.key].toString().replace(/,/g, '') : '0';
          const val = parseFloat(cleanVal) || 0;
          return acc + val;
        }, 0);
      }
    });
    return sums;
  }, [data, columns]);

  // Render Row Helper
  const renderRow = ({ item, index }) => (
    <View style={[styles.row, index % 2 === 1 && styles.alternateRow]}>
      {effectiveColumns.map((col) => (
        <View key={col.key} style={[styles.cell, { width: col.width }]}>
          {col.key === 'SerialNo' ? (
            <Text style={styles.cellText}>{index + 1}</Text>
          ) : (
            <Text 
              style={[
                styles.cellText, 
                (col.type === 'money' || col.total) && { textAlign: 'right' }
              ]}
              numberOfLines={1}
            >
              {col.type === 'money' 
                ? formatCurrency(item[col.key]) 
                : col.type === 'date' 
                  ? formatDate(item[col.key]) 
                  : item[col.key]}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.gridContainer} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
        <View>
          {/* HEADER */}
          <View style={styles.headerRow}>
            {effectiveColumns.map((col) => (
              <View key={col.key} style={[styles.cell, { width: col.width }]}>
                <Text style={[
                  styles.headerText,
                  (col.type === 'money' || col.total) && { textAlign: 'right' }
                ]}>
                  {col.title}
                </Text>
              </View>
            ))}
          </View>

          {/* BODY */}
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderRow}
            getItemLayout={(data, index) => ({ length: 45, offset: 45 * index, index })}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
          />

          {/* FOOTER */}
          <View style={styles.footerRow}>
            {effectiveColumns.map((col) => (
              <View key={col.key} style={[styles.cell, { width: col.width }]}>
                {col.key === 'SerialNo' ? (
                  <Text style={styles.footerLabel}>Total:</Text>
                ) : col.total ? (
                  <Text 
                    style={[styles.footerValue, { textAlign: 'right' }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {col.type === 'money' ? formatCurrency(totals[col.key]) : totals[col.key]}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// --- Formatters ---
const formatCurrency = (val) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (val) => {
  if (!val) return '-';
  if (typeof val === 'string' && val.includes('/Date(')) {
    const num = parseInt(val.match(/\d+/)[0], 10);
    return new Date(num).toLocaleDateString();
  }
  return new Date(val).toLocaleDateString();
};

const styles = StyleSheet.create({
  gridContainer: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#DDD' },
  cell: { paddingHorizontal: 8, paddingVertical: 10, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', backgroundColor: COLORS.primary, height: 45, alignItems: 'center' },
  headerText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', height: 45, alignItems: 'center' },
  alternateRow: { backgroundColor: '#F8F9FA' },
  cellText: { fontSize: 12, color: '#333' },
  footerRow: { 
    flexDirection: 'row', 
    backgroundColor: '#EEE', 
    borderTopWidth: 2, 
    borderColor: '#999',
    height: 50, 
    alignItems: 'center'
  },
  footerLabel: { fontWeight: 'bold', fontSize: 13, color: 'black' },
  footerValue: { fontWeight: 'bold', fontSize: 13, color: COLORS.primary }
});

export default DataGrid;