import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Image } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

export function Home() {
    const navigate = useRoute();
    const navigation = useNavigation();

    const [nom, setNom] = useState('');
    const [address, setAddress] = useState('');
    const [telephone, setTelephone] = useState('');
    const [secteur, setSecteur] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.container2}>
                <Image
                    source={require('../assets/images/facture.png')}
                    style={styles.image}
                />
            </View>
            <Text style={styles.milieu}>
                Détails de l'entreprise
            </Text>
            <Text style={styles.milieu2}>Ces informations seront utilisées pour vos factures et peuvent être modifiées ultérieusement</Text>
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Nom"
                    placeholderTextColor="black"
                    value={nom}
                    onChangeText={setNom}
                />
                <TextInput
                    style={styles.input}
                    placeholder="adresse"
                    placeholderTextColor="black"
                    value={address}
                    onChangeText={setAddress}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Téléphone"
                    placeholderTextColor="black"
                    value={telephone}
                    onChangeText={setTelephone}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Secteur activité"
                    placeholderTextColor="black"
                    value={secteur}
                    onChangeText={setSecteur}
                />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('UploadLogo')}>
                <Text style={styles.finB}>Continuer</Text>
            </TouchableOpacity>
        </View>
    );
}

