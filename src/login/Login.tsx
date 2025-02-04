import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Image } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

export function Login() {
    const navigate = useRoute();
    const navigation = useNavigation();

    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.container2}>
                <Image
                    source={require('../assets/images/facture.png')}
                    style={styles.image}
                />
            </View>
            <View style={styles.container3}>
                <TextInput
                    style={styles.input}
                    placeholder="Nom"
                    placeholderTextColor="black"
                    value={nom}
                    onChangeText={setNom}
                />
                <TextInput
                    style={styles.input}
                    placeholder="email"
                    placeholderTextColor="black"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <Text style={styles.finB}>Se connecter</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                <Text style={styles.finA}>Créer un compte</Text>
            </TouchableOpacity>
        </View>
    );
}

