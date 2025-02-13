import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Image } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';
import { register } from '../api/auth';

export function CreateAccount() {
    const navigate = useRoute();
    const navigation = useNavigation();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpass, setConfirmpass] = useState('');
    const [error, setError] = useState('');

    const validatePassword = () => {
        if (password !== confirmpass) {
            setError('Les mots de passe ne correspondent pas');
            return false;
        }
        setError('');
        return true;
    };
    const handleSubmit = async () => {
        if (!validatePassword() || !username || !email) return;
        console.log('submit');
        const response = await register(email, username, password, confirmpass);
        if (response.status === 201 || response.status === 200) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
        } else {
            setError('Vérifier vos informations');
        }
    }

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
                    value={username}
                    onChangeText={setUsername}
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
            <TouchableOpacity onPress={handleSubmit}>
                <Text style={styles.finB}>Créer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.finA}>Annuler</Text>
            </TouchableOpacity>
        </View>
    );
}

