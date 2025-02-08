import React, { useState } from 'react';
import { View, Button, SafeAreaView, Text } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export const CustomDatePicker = () => {
    const [date, setDate] = useState(new Date(1598051730000));
    const [show, setShow] = useState(false);
  
    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate;
      setShow(false);
      setDate(currentDate);
    };
  
    const showDatepicker = () => {
        setShow(true);
    };
  
    return (
      <SafeAreaView>
        
        <Text onPress={showDatepicker}>selected: {date.toLocaleString()}</Text>
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode='date'
            is24Hour={true}
            onChange={onChange}
          />
        )}
      </SafeAreaView>
    );
  };
