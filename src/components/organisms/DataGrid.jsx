import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../config/theme';
import { getReportColumns } from '../../config/columnConfig'; 
import { fetchSubGrid } from '../../services/reportService';    

const DataGrid = ({ 
  data, columns, isGrouped, groupBy, hasSubGrid, 
  subApi, subGridKey, pk = 'ID', filters = {}, onPrintRow 
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [subData, setSubData] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  const processedData = useMemo(() => {
    if (!isGrouped || !groupBy) return data;
    const groupedList = [];
    let lastGroupVal = null;
    data.forEach(item => {
      const currentGroupVal = item[groupBy];
      if (currentGroupVal !== lastGroupVal) {
        groupedList.push({ isGroupHeader: true, title: `${groupBy}: ${currentGroupVal}`, id: `group-${currentGroupVal}` });
        lastGroupVal = currentGroupVal;
      }
      groupedList.push(item);
    });
    return groupedList;
  }, [data, isGrouped, groupBy]);

  const effectiveColumns = useMemo(() => {
    if (containerWidth === 0) return columns;
    const totalFixed = columns.reduce((sum, col) => sum + (col.width || 100), 0);
    if (totalFixed < containerWidth) {
      const scale = containerWidth / totalFixed;
      return columns.map(col => ({ ...col, width: Math.floor((col.width || 100) * scale) - 1 }));
    }
    return columns;
  }, [columns, containerWidth]);

  const handleRowClick = async (item) => {
    if (!hasSubGrid) return;
    const id = item[pk]; 
    if (!id) return;
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setSubLoading(true);
    setSubData([]);
    try {
      const result = await fetchSubGrid(subApi, id, pk, filters);
      setSubData(result);
    } catch (err) { console.error("Subgrid error", err); } 
    finally { setSubLoading(false); }
  };

  const renderSubGrid = () => {
    if (subLoading) return <ActivityIndicator size="small" color={COLORS.secondary} style={{ padding: 20 }} />;
    if (!subData || subData.length === 0) return <Text style={styles.noDataText}>No details found.</Text>;
    const subCols = getReportColumns(subGridKey);
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.subGridWrapper}>
          <View style={styles.subHeaderRow}>
            {subCols.map((col, i) => (
              <View key={i} style={[styles.subCell, { width: col.width || 100 }]}>
                <Text style={styles.subHeaderText} numberOfLines={2}>{col.title}</Text>
              </View>
            ))}
          </View>
          {subData.map((subItem, idx) => (
            <View key={idx} style={[styles.subRow, idx % 2 !== 0 && { backgroundColor: '#F1F8E9' }]}>
              {subCols.map((col, i) => (
                <View key={i} style={[styles.subCell, { width: col.width || 100 }]}>
                  <Text style={[styles.subCellText, { textAlign: (col.type === 'money' || col.type === 'number' || col.total) ? 'right' : 'center' }]} numberOfLines={2}>
                    {col.type === 'money' ? formatCurrency(subItem[col.key]) : col.type === 'date' ? formatDate(subItem[col.key]) : subItem[col.key]}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderRow = ({ item, index }) => {
    if (item.isGroupHeader) return <View style={styles.groupHeaderRow}><Ionicons name="caret-down-outline" size={16} color="#006064" style={{ marginRight: 5 }} /><Text style={styles.groupHeaderText}>{item.title}</Text></View>;
    const isExpanded = expandedId === item[pk];

    return (
      <View>
        <TouchableOpacity 
          activeOpacity={hasSubGrid ? 0.7 : 1}
          onPress={() => handleRowClick(item)}
          style={[styles.row, index % 2 === 1 && styles.alternateRow, isExpanded && styles.expandedRow]}
        >
          {effectiveColumns.map((col) => (
            <View key={col.key} style={[styles.cell, { width: col.width }]}>
              {col.key === 'SerialNo' || col.key === columns[0].key ? (
                 <View style={{flexDirection:'row', alignItems:'center'}}>
                    {hasSubGrid && <Ionicons name={isExpanded ? "chevron-down" : "chevron-forward"} size={14} color="#666" style={{marginRight: 4}} />}
                    <Text style={styles.cellText} numberOfLines={2}>
                      {col.key === 'SerialNo' ? index + 1 : item[col.key]}
                    </Text>
                 </View>
              ) : col.type === 'action_group' || col.key === 'Print' ? (
                <View style={styles.actionGroup}>
                  <TouchableOpacity 
                    style={[styles.iconBtn, { backgroundColor: '#FFC107' }]} 
                    onPress={() => onPrintRow && onPrintRow(item)} 
                  >
                    <Ionicons name="print-outline" size={14} color="black" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text 
                  style={[styles.cellText, (col.type === 'money' || col.total) && { textAlign: 'right' }]} 
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {col.type === 'money' ? formatCurrency(item[col.key]) : col.type === 'date' ? formatDate(item[col.key]) : item[col.key]}
                </Text>
              )}
            </View>
          ))}
        </TouchableOpacity>
        {isExpanded && <View style={styles.subGridContainer}>{renderSubGrid()}</View>}
      </View>
    );
  };

  const totals = useMemo(() => {
    const sums = {};
    columns.forEach(col => {
      if (col.total) {
        sums[col.key] = data.reduce((acc, curr) => {
          if (curr.isGroupHeader) return acc;
          const cleanVal = curr[col.key] ? curr[col.key].toString().replace(/,/g, '') : '0';
          return acc + (parseFloat(cleanVal) || 0);
        }, 0);
      }
    });
    return sums;
  }, [data, columns]);

  return (
    <View style={styles.gridContainer} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{flexGrow: 1}}>
        <View>
          <View style={styles.headerRow}>
            {effectiveColumns.map((col) => (
              <View key={col.key} style={[styles.cell, { width: col.width }]}>
                <Text style={[styles.headerText, (col.type === 'money' || col.total) && { textAlign: 'right' }]} numberOfLines={2}>
                  {col.title}
                </Text>
              </View>
            ))}
          </View>
          
          <FlatList data={processedData} keyExtractor={(item, index) => item.id || index.toString()} renderItem={renderRow} />
          
          <View style={styles.footerRow}>
            {effectiveColumns.map((col, index) => (
              <View key={col.key} style={[styles.cell, { width: col.width }]}>
                {/* index === 1 moves 'Total:' to the second column instead of SerialNo */}
                {index === 1 ? (
                  <Text style={styles.footerLabel}>Total:</Text>
                ) : col.total ? (
                  <Text style={[styles.footerValue, { textAlign: 'right' }]} numberOfLines={2}>
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

const formatCurrency = (val) => { if (!val) return '0.00'; const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val; return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2 }); };
const formatDate = (val) => { if (!val) return '-'; if (typeof val === 'string' && val.includes('/Date(')) { const num = parseInt(val.match(/\d+/)[0], 10); return new Date(num).toLocaleDateString(); } return new Date(val).toLocaleDateString(); };

const styles = StyleSheet.create({
  gridContainer: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#DDD' },
  cell: { paddingHorizontal: 6, paddingVertical: 4, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', backgroundColor: COLORS.primary, minHeight: 50, alignItems: 'center' },
  headerText: { color: 'white', fontWeight: 'bold', fontSize: 12, lineHeight: 15 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', minHeight: 55, alignItems: 'center' },
  alternateRow: { backgroundColor: '#F8F9FA' },
  expandedRow: { backgroundColor: '#E3F2FD', borderLeftWidth: 4, borderLeftColor: COLORS.secondary },
  cellText: { fontSize: 11, color: '#333', lineHeight: 14 },
  footerRow: { flexDirection: 'row', backgroundColor: '#EEE', borderTopWidth: 2, borderColor: '#999', minHeight: 50, alignItems: 'center' },
  footerLabel: { fontWeight: 'bold', fontSize: 13, color: 'black' },
  footerValue: { fontWeight: 'bold', fontSize: 12, color: COLORS.primary },
  groupHeaderRow: { flexDirection: 'row', backgroundColor: '#E0F7FA', padding: 8, borderBottomWidth: 1, borderColor: '#B2EBF2', alignItems: 'center' },
  groupHeaderText: { fontWeight: 'bold', color: '#006064', fontSize: 13 },
  subGridContainer: { backgroundColor: '#ECEFF1', padding: 10, borderBottomWidth: 1, borderColor: '#CFD8DC' },
  subGridWrapper: { backgroundColor: 'white', borderRadius: 6, overflow: 'hidden', elevation: 1 },
  subHeaderRow: { flexDirection: 'row', backgroundColor: '#546E7A', minHeight: 40, alignItems: 'center' },
  subHeaderText: { fontWeight: 'bold', fontSize: 10, color: 'white', textAlign: 'center', lineHeight: 12 }, 
  subRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEEEEE', minHeight: 45, alignItems: 'center' },
  subCell: { paddingHorizontal: 4, borderRightWidth: 1, borderRightColor: '#F5F5F5', justifyContent: 'center' },
  subCellText: { fontSize: 10, color: '#455A64', lineHeight: 12 }, 
  noDataText: { fontSize: 12, color: '#999', fontStyle: 'italic', padding: 10, textAlign:'center' },
  actionGroup: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
  iconBtn: { padding: 6, borderRadius: 4 }
});

export default DataGrid;