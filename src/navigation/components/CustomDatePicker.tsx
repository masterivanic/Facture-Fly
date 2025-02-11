import React, { useState } from 'react';
import { View, Button, SafeAreaView, Text } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { formatDate } from '../../utils';

export const CustomDatePicker = ({date, setDate}) => {

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
        
        <Text onPress={showDatepicker}>{formatDate(date)}</Text>
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
