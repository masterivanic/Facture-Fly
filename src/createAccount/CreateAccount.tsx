import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Image } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

export function CreateAccount() {
    const navigate = useRoute();
    const navigation = useNavigation();

    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpass, setConfirmpass] = useState('');
    const [error, setError] = useState('');

    const validatePassword = () => {
      if (password !== confirmpass) {
        setError('Les mots de passe ne correspondent pas');
      } else {
        setError('');
      }
    };

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
                    placeholder="Email"
                    placeholderTextColor="black"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor="black"
                    value={password}
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirmer votre mot de passe"
                    placeholderTextColor="black"
                    value={confirmpass}
                    onChangeText={setConfirmpass}
                    secureTextEntry={true}
                    onBlur={validatePassword}
                />
                {error ? <Text>{error}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('CreateHome')}>
                <Text style={styles.finB}>Créer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.finA}>Annuler</Text>
            </TouchableOpacity>
        </View>
    );
}

