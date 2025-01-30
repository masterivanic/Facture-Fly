import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { styles } from './styles'



export function Bienvenu() {
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
            <TouchableOpacity>
                <Text style={styles.fin}>Créer une nouvelle facture</Text>
            </TouchableOpacity>

        </View>
    );
}

