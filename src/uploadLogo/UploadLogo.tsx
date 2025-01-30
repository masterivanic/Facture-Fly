import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

export function UploadLogo() {
    const navigation = useNavigation();
    const [image, setImage] = useState<String>("");

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const data = result.assets[0]
            if (data != null) {

                setImage(data.uri);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.milieu}>
                Télécharger le logo de votre entreprise
            </Text>
            <Text style={styles.milieu2}>Donner à votre facture un aspect professionnel et de marque</Text>

            <View style={styles.uploadFrame}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.uploadedImage} />
                ) : (
                    <Text style={styles.uploadPlaceholder}>Votre logo</Text>
                )}
            </View>

            <TouchableOpacity onPress={pickImage}>
                <Text style={styles.fin}>Télécharger</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('HomeTabs')}>
                <Text style={styles.finB}>Continuer</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('HomeTabs')}>
                <Text style={styles.finC}>Retour</Text>
            </TouchableOpacity>
        </View>
    );
}

