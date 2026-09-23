import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, FlatList, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Calendar } from "react-native-calendars";
import { IconButton, Text } from "react-native-paper";
import SectionText from "@/components/typography/SectionText";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  minDate?: string;
  maxDate?: string;
}

const toCalendarDate = (date?: Date) => {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  title = "Select Date",
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
}) => {
  const selectedDateKey = toCalendarDate(selectedDate);

  const [viewDate, setViewDate] = useState(selectedDateKey || toCalendarDate(new Date())!);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Re-sync the visible month/year (and collapse the year list) each time the modal is reopened.
  useEffect(() => {
    if (visible) {
      setViewDate(selectedDateKey || toCalendarDate(new Date())!);
      setShowYearPicker(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const markedDates = useMemo(() => {
    if (!selectedDateKey) return {};

    return {
      [selectedDateKey]: {
        selected: true,
        selectedColor: "#000",
      },
    };
  }, [selectedDateKey]);

  const viewYear = Number(viewDate.slice(0, 4));
  const minYear = minDate ? Number(minDate.slice(0, 4)) : viewYear - 100;
  const maxYear = maxDate ? Number(maxDate.slice(0, 4)) : viewYear + 10;

  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = maxYear; year >= minYear; year--) list.push(year);
    return list;
  }, [minYear, maxYear]);

  const handleSelectYear = (year: number) => {
    setViewDate(`${year}-${viewDate.slice(5, 7)}-01`);
    setShowYearPicker(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <SectionText text={title}/>

            <IconButton
              icon="close"
              size={22}
              onPress={onClose}
            />
          </View>

          <TouchableOpacity
            style={styles.yearTrigger}
            activeOpacity={0.7}
            onPress={() => setShowYearPicker((prev) => !prev)}
          >
            <Text style={styles.yearTriggerText}>{viewYear}</Text>
            <IconButton
              icon={showYearPicker ? "chevron-up" : "chevron-down"}
              size={18}
              style={styles.yearTriggerIcon}
            />
          </TouchableOpacity>

          {showYearPicker ? (
            <FlatList
              data={years}
              keyExtractor={(item) => String(item)}
              numColumns={4}
              style={styles.yearList}
              columnWrapperStyle={styles.yearRow}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.yearItem, item === viewYear && styles.yearItemActive]}
                  onPress={() => handleSelectYear(item)}
                >
                  <Text style={[styles.yearItemText, item === viewYear && styles.yearItemTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Calendar
              current={viewDate}
              minDate={minDate}
              maxDate={maxDate}
              markedDates={markedDates}
              onMonthChange={(month) => setViewDate(month.dateString)}
              onDayPress={(day) => {
                onSelectDate(new Date(`${day.dateString}T00:00:00`));
                onClose();
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  container: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: "20@ms",
    borderTopRightRadius: "20@ms",
    padding: "18@ms",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10@ms",
  },

  yearTrigger: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: "6@ms",
    paddingHorizontal: "10@ms",
    paddingVertical: "4@ms",
    borderRadius: "10@ms",
    backgroundColor: "#F5F5F5",
  },

  yearTriggerText: {
    fontSize: "15@ms",
    fontWeight: "700",
    color: "#111",
  },

  yearTriggerIcon: {
    margin: 0,
  },

  yearList: {
    maxHeight: "320@vs",
  },

  yearRow: {
    justifyContent: "flex-start",
  },

  yearItem: {
    width: "23%",
    marginRight: "2%",
    marginBottom: "10@vs",
    paddingVertical: "12@vs",
    borderRadius: "10@ms",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },

  yearItemActive: {
    backgroundColor: "#111",
  },

  yearItemText: {
    fontSize: "13@ms",
    color: "#111",
    fontWeight: "600",
  },

  yearItemTextActive: {
    color: "#FFF",
  },
});

export default DatePickerModal;
