/**
 * Create Listing Screen
 * Interface for creating marketplace listings
 */

import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Chip,
  IconButton,
  Appbar,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';

import {useAuth} from '../../contexts/AuthContext';
import {useFirebase} from '../../contexts/FirebaseContext';
import {RootStackParamList} from '../../types';
import {theme} from '../../utils/theme';

type CreateListingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateListing'>;

const CreateListingScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category: 'cards',
    condition: 'good',
    shippingCost: '',
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<CreateListingScreenNavigationProp>();
  const {user} = useAuth();
  const {firestore, helpers} = useFirebase();

  const categories = [
    {key: 'cards', label: 'Trading Cards'},
    {key: 'collectibles', label: 'Collectibles'},
    {key: 'accessories', label: 'Accessories'},
    {key: 'digital', label: 'Digital Items'},
  ];

  const conditions = [
    {key: 'new', label: 'New'},
    {key: 'like-new', label: 'Like New'},
    {key: 'good', label: 'Good'},
    {key: 'fair', label: 'Fair'},
    {key: 'poor', label: 'Poor'},
  ];

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddImages = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 5 - selectedImages.length,
      },
      (response) => {
        if (response.assets) {
          const newImages = response.assets
            .filter(asset => asset.uri)
            .map(asset => asset.uri!);
          setSelectedImages([...selectedImages, ...newImages]);
        }
      }
    );
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setSelectedImages(selectedImages.filter(image => image !== imageToRemove));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadPromises = selectedImages.map(async (imageUri, index) => {
      const fileName = `listing_${Date.now()}_${index}.jpg`;
      return await helpers.uploadFile(imageUri, fileName, 'marketplace');
    });

    return await Promise.all(uploadPromises);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your listing');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }

    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return false;
    }

    return true;
  };

  const handleCreateListing = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      // Upload images
      const imageUrls = await uploadImages();

      // Create listing object
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        currency: formData.currency,
        sellerId: user.uid,
        sellerName: user.displayName || 'Anonymous',
        images: imageUrls,
        category: formData.category,
        condition: formData.condition,
        status: 'available',
        createdAt: helpers.timestamp(),
        updatedAt: helpers.timestamp(),
        tags: tags,
        shipping: {
          cost: Number(formData.shippingCost) || 0,
          methods: ['Standard Shipping'],
          locations: ['United States'],
        },
      };

      // Save listing to Firestore
      await firestore
        .collection('marketplace')
        .add(listingData);

      Alert.alert(
        'Success',
        'Your listing has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Listing" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Basic Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              label="Title"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              mode="outlined"
              maxLength={100}
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              mode="outlined"
              multiline
              numberOfLines={4}
              maxLength={1000}
              style={styles.input}
              disabled={loading}
            />

            <View style={styles.priceContainer}>
              <TextInput
                label="Price"
                value={formData.price}
                onChangeText={(value) => updateFormData('price', value)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.priceInput}
                disabled={loading}
              />
              <TextInput
                label="Currency"
                value={formData.currency}
                onChangeText={(value) => updateFormData('currency', value)}
                mode="outlined"
                style={styles.currencyInput}
                disabled={loading}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Category & Condition */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.optionsContainer}>
              {categories.map((category) => (
                <Chip
                  key={category.key}
                  selected={formData.category === category.key}
                  onPress={() => updateFormData('category', category.key)}
                  style={[
                    styles.optionChip,
                    formData.category === category.key && styles.selectedChip,
                  ]}
                  disabled={loading}>
                  {category.label}
                </Chip>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Condition</Text>
            <View style={styles.optionsContainer}>
              {conditions.map((condition) => (
                <Chip
                  key={condition.key}
                  selected={formData.condition === condition.key}
                  onPress={() => updateFormData('condition', condition.key)}
                  style={[
                    styles.optionChip,
                    formData.condition === condition.key && styles.selectedChip,
                  ]}
                  disabled={loading}>
                  {condition.label}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Images */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Images</Text>
              <Button
                mode="outlined"
                onPress={handleAddImages}
                disabled={loading || selectedImages.length >= 5}
                compact>
                Add Images
              </Button>
            </View>
            
            {selectedImages.length > 0 && (
              <View style={styles.imagesContainer}>
                {selectedImages.map((imageUri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{uri: imageUri}} style={styles.selectedImage} />
                    <IconButton
                      icon="close"
                      size={20}
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(imageUri)}
                      disabled={loading}
                    />
                  </View>
                ))}
              </View>
            )}
            
            <Text style={styles.helperText}>
              Add up to 5 high-quality images. The first image will be the main photo.
            </Text>
          </Card.Content>
        </Card>

        {/* Tags */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                label="Add tag"
                value={currentTag}
                onChangeText={setCurrentTag}
                mode="outlined"
                style={styles.tagInput}
                onSubmitEditing={handleAddTag}
                disabled={loading}
              />
              <Button
                mode="contained"
                onPress={handleAddTag}
                disabled={!currentTag.trim() || loading}
                compact>
                Add
              </Button>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    onClose={() => handleRemoveTag(tag)}
                    style={styles.tagChip}
                    disabled={loading}>
                    #{tag}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Shipping */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Shipping</Text>
            
            <TextInput
              label="Shipping Cost (optional)"
              value={formData.shippingCost}
              onChangeText={(value) => updateFormData('shippingCost', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              disabled={loading}
            />
            
            <Text style={styles.helperText}>
              Leave blank for free shipping. Shipping methods and locations can be configured later.
            </Text>
          </Card.Content>
        </Card>

        {/* Create Button */}
        <View style={styles.createButtonContainer}>
          <Button
            mode="contained"
            onPress={handleCreateListing}
            loading={loading}
            disabled={loading}
            style={styles.createButton}
            contentStyle={styles.createButtonContent}>
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  priceContainer: {
    flexDirection: 'row',
  },
  priceInput: {
    flex: 2,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  currencyInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  optionChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  tagInput: {
    flex: 1,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  createButtonContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
  },
  createButtonContent: {
    paddingVertical: theme.spacing.sm,
  },
});

export default CreateListingScreen;
