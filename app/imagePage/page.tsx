import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styles from './styles';
import { useRouter } from 'expo-router';

function UploadImage() {
  const router = useRouter();
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
      
      <TouchableOpacity  onPress={pickImage}>
        <Text style={styles.fin}>Télécharger</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/screens/page')}>
        <Text style={styles.finB}>Continuer</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/accueil/page')}>
        <Text style={styles.finC}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

export default UploadImage;
