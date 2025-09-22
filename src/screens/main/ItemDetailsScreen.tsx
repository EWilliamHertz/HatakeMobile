/**
 * Item Details Screen
 * Detailed view of marketplace items
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Avatar,
  Chip,
  Divider,
  Appbar,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../contexts/AuthContext';
import {useFirebase} from '../../contexts/FirebaseContext';
import {MarketplaceItem, RootStackParamList} from '../../types';
import {theme} from '../../utils/theme';

type ItemDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ItemDetails'>;
type ItemDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ItemDetails'>;

const ItemDetailsScreen: React.FC = () => {
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);

  const route = useRoute<ItemDetailsScreenRouteProp>();
  const navigation = useNavigation<ItemDetailsScreenNavigationProp>();
  const {user} = useAuth();
  const {firestore} = useFirebase();

  const {itemId} = route.params;

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      const itemDoc = await firestore
        .collection('marketplace')
        .doc(itemId)
        .get();

      if (itemDoc.exists) {
        const itemData = itemDoc.data() as MarketplaceItem;
        setItem({
          id: itemDoc.id,
          ...itemData,
          createdAt: itemData.createdAt,
          updatedAt: itemData.updatedAt,
        });
      } else {
        Alert.alert('Error', 'Item not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const handleContactSeller = () => {
    if (!item) return;
    Alert.alert('Contact Seller', 'Messaging feature coming soon');
  };

  const handleMakeOffer = () => {
    if (!item) return;
    Alert.alert('Make Offer', 'Trading feature coming soon');
  };

  const handleBuyNow = () => {
    if (!item) return;
    Alert.alert('Buy Now', 'Purchase feature coming soon');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return null;
  }

  const isOwner = user?.uid === item.sellerId;

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={item.title} />
        <Appbar.Action icon="share" onPress={() => {}} />
        <Appbar.Action icon="heart-outline" onPress={() => {}} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Images */}
        <View style={styles.imagesContainer}>
          <Image
            source={{uri: item.images[0] || 'https://via.placeholder.com/400x300'}}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {item.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailsContainer}>
              {item.images.slice(1).map((imageUrl, index) => (
                <Image
                  key={index}
                  source={{uri: imageUrl}}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Item Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemPrice}>
              {formatPrice(item.price, item.currency)}
            </Text>
            
            <View style={styles.itemMeta}>
              <Chip icon="tag" style={styles.metaChip}>
                {item.category}
              </Chip>
              <Chip icon="star" style={styles.metaChip}>
                {item.condition}
              </Chip>
              <Chip
                icon="circle"
                style={[
                  styles.metaChip,
                  {backgroundColor: item.status === 'available' ? theme.colors.success : theme.colors.error}
                ]}>
                {item.status}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>

            {item.tags && item.tags.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {item.tags.map((tag, index) => (
                    <Chip key={index} style={styles.tagChip}>
                      #{tag}
                    </Chip>
                  ))}
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Seller Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Seller</Text>
            <View style={styles.sellerInfo}>
              <Avatar.Icon
                size={48}
                icon="account"
                style={styles.sellerAvatar}
              />
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{item.sellerName}</Text>
                <Text style={styles.sellerMeta}>Member since 2024</Text>
                <Text style={styles.sellerMeta}>⭐ 4.8 rating</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Shipping Info */}
        {item.shipping && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Shipping</Text>
              <Text style={styles.shippingCost}>
                Cost: {formatPrice(item.shipping.cost, item.currency)}
              </Text>
              <Text style={styles.shippingMethods}>
                Methods: {item.shipping.methods.join(', ')}
              </Text>
              <Text style={styles.shippingLocations}>
                Ships to: {item.shipping.locations.join(', ')}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {!isOwner && item.status === 'available' && (
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleContactSeller}
            style={styles.actionButton}>
            Contact Seller
          </Button>
          <Button
            mode="outlined"
            onPress={handleMakeOffer}
            style={styles.actionButton}>
            Make Offer
          </Button>
          <Button
            mode="contained"
            onPress={handleBuyNow}
            style={styles.buyButton}>
            Buy Now
          </Button>
        </View>
      )}

      {isOwner && (
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Edit Listing', 'Edit feature coming soon')}
            style={styles.actionButton}>
            Edit Listing
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Delete Listing', 'Delete feature coming soon')}
            style={styles.actionButton}
            textColor={theme.colors.error}>
            Delete
          </Button>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.onBackground,
  },
  imagesContainer: {
    backgroundColor: theme.colors.surface,
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  thumbnailsContainer: {
    padding: theme.spacing.sm,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    marginRight: theme.spacing.sm,
    borderRadius: 8,
  },
  card: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  metaChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 16,
    color: theme.colors.onSurface,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
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
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    backgroundColor: theme.colors.primary,
  },
  sellerDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  sellerMeta: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
  shippingCost: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  shippingMethods: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.8,
    marginBottom: theme.spacing.xs,
  },
  shippingLocations: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  buyButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
  },
});

export default ItemDetailsScreen;
