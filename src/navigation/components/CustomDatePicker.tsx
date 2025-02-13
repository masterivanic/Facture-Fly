import React from 'react';
import { View, Text, Platform } from 'react-native';
import DateTimePicker, { 
  DateTimePickerEvent,
  DateTimePickerAndroid 
} from '@react-native-community/datetimepicker';
import { formatDate } from '../../utils';

export const CustomDatePicker = ({ date, setDate }: { 
  date: Date; 
  setDate: (date: Date) => void 
}) => {
  const handleAndroidDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        is24Hour: true,
        onChange: handleAndroidDateChange,
      });
    }
  };

  return (
    <View>
      <Text onPress={showDatePicker}>{formatDate(date)}</Text>
      
      {Platform.OS === 'ios' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          is24Hour={true}
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
};