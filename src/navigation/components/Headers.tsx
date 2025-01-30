import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';

export const DefaultHeader = ({ title, onSettingsPress, onSearchPress }) => {
    return (
      <View style={styles.headerContainer}>
        {/* Settings Icon */}
        <TouchableOpacity onPress={onSettingsPress}>
        <Ionicons name="cog" size={34} color="black" />
        </TouchableOpacity>
  
        {/* Title */}
        <Text style={styles.headerTitle}>{title}</Text>
  
        {/* Search Icon */}
        <TouchableOpacity onPress={onSearchPress}>
        <AntDesign name="search1" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
};
export const FactureCreationHeader = ({ title, onBackPress, onDotsPress }) => {
    return (
      <View style={styles.headerContainer}>
        {/* Settings Icon */}
        <TouchableOpacity onPress={onBackPress}>
        <MaterialCommunityIcons name="chevron-left" size={34} color="black" />
        </TouchableOpacity>
  
        {/* Title */}
        <Text style={styles.headerTitle}>{title}</Text>
  
        {/* Search Icon */}
        <TouchableOpacity onPress={onDotsPress}>
        <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
};

  
const styles = StyleSheet.create({
headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00E5E5', // Match the turquoise color in your screenshot
    paddingHorizontal: 16,
    paddingVertical: 10,

},
headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
},
});