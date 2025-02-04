import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

export function CreateHome() {
    const navigate = useRoute();
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
             <View style={styles.container2}>
                <Image
                    source={require('../assets/images/facture.png')}
                        style={styles.image}
                />
            </View>
            <Text></Text>
            <Text style={styles.secondaire}>Vous y êtes presque !</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <Text style={styles.finB}>Continuer</Text>
            </TouchableOpacity>
        </View>
    );
}

