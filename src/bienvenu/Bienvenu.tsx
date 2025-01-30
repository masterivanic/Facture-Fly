import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { styles } from './styles'
import { useNavigation } from '@react-navigation/native';



export function Bienvenu() {
    const navigate = useNavigation()
    return (
        <View style={styles.container}>
            <Text style={styles.milieu}>
                Vous êtes prêt !{' '}
                <Image
                    source={require('../assets/images/fete.png')}
                    style={styles.image}
                />
            </Text>
            <Text style={styles.milieu2}>Bienvenue dans le monde de la facturation ultra rapide !</Text>
            <TouchableOpacity onPress={() => navigate.navigate('HomeTabs')}>
                <Text style={styles.fin}>Commencer à créer des factures !</Text>
            </TouchableOpacity>

        </View>
    );
}

