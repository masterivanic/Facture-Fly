import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

export function CreateHome() {
    const navigate = useRoute();
    const navigation = useNavigation();

    return (
        <View style={styles.depart}>
                   <View style={styles.depart2}>
                       <Image
                           source={require('../assets/images/facture.png')}
                       />
                   </View>
                   <Text style={styles.depart3}>Vous y êtes presque !! let's go</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.finB}>Continuer</Text>
                    </TouchableOpacity>
        </View>
    );
}

