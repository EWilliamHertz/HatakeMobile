/**
 * Marketplace Screen
 * Browse and search marketplace items
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  FAB,
  Searchbar,
  Chip,
  Card,
  Button,
  Avatar,
  Appbar,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../contexts/AuthContext';
import {useFirebase} from '../../contexts/FirebaseContext';
import {MarketplaceItem, RootStackParamList} from '../../types';
import {theme} from '../../utils/theme';

type MarketplaceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MarketplaceScreen: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const navigation = useNavigation<MarketplaceScreenNavigationProp>();
  const {user} = useAuth();
  const {firestore, collections} = useFirebase();

  const categories = [
    {key: 'all', label: 'All Items'},
    {key: 'cards', label: 'Trading Cards'},
    {key: 'collectibles', label: 'Collectibles'},
    {key: 'accessories', label: 'Accessories'},
    {key: 'digital', label: 'Digital Items'},
  ];

  const loadItems = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      let query = firestore
        .collection('marketplace')
        .where('status', '==', 'available')
        .orderBy('createdAt', 'desc')
        .limit(50);

      if (selectedCategory !== 'all') {
        query = firestore
          .collection('marketplace')
          .where('category', '==', selectedCategory)
          .where('status', '==', 'available')
          .orderBy('createdAt', 'desc')
          .limit(50);
      }

      const itemsSnapshot = await query.get();

      const loadedItems: MarketplaceItem[] = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as MarketplaceItem[];

      setItems(loadedItems);
      applySearchFilter(loadedItems, searchQuery);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
      Alert.alert('Error', 'Failed to load marketplace items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applySearchFilter = (itemsToFilter: MarketplaceItem[], query: string) => {
    if (!query.trim()) {
      setFilteredItems(itemsToFilter);
      return;
    }

    const filtered = itemsToFilter.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(query.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredItems(filtered);
  };

  useEffect(() => {
    loadItems();
  }, [selectedCategory]);

  const onRefresh = () => {
    loadItems(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applySearchFilter(items, query);
  };

  const handleCategoryChange = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const navigateToCreateListing = () => {
    navigation.navigate('CreateListing');
  };

  const navigateToItemDetails = (itemId: string) => {
    navigation.navigate('ItemDetails', {itemId});
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const renderItem = ({item}: {item: MarketplaceItem}) => (
    <Card style={styles.itemCard} onPress={() => navigateToItemDetails(item.id)}>
      <Card.Cover
        source={{uri: item.images[0] || 'https://via.placeholder.com/300x200'}}
        style={styles.itemImage}
      />
      <Card.Content style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>
          {formatPrice(item.price, item.currency)}
        </Text>
        <Text style={styles.itemCondition}>
          Condition: {item.condition}
        </Text>
        
        <View style={styles.sellerInfo}>
          <Avatar.Icon
            size={24}
            icon="account"
            style={styles.sellerAvatar}
          />
          <Text style={styles.sellerName}>{item.sellerName}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCategory = (category: {key: string; label: string}) => (
    <Chip
      key={category.key}
      selected={selectedCategory === category.key}
      onPress={() => handleCategoryChange(category.key)}
      style={[
        styles.categoryChip,
        selectedCategory === category.key && styles.selectedCategoryChip,
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === category.key && styles.selectedCategoryChipText,
      ]}>
      {category.label}
    </Chip>
  );

  const keyExtractor = (item: MarketplaceItem) => item.id;

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Marketplace" />
        <Appbar.Action icon="filter" onPress={() => {}} />
      </Appbar.Header>

      <Searchbar
        placeholder="Search items..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
      />

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={({item}) => renderCategory(item)}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Be the first to list an item for sale!"}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={navigateToCreateListing}
        label="Sell"
      />
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
  searchbar: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    color: theme.colors.onSurface,
  },
  categoriesContainer: {
    paddingVertical: theme.spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.md,
  },
  categoryChip: {
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipText: {
    color: theme.colors.onSurface,
  },
  selectedCategoryChipText: {
    color: theme.colors.onPrimary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  itemCard: {
    flex: 1,
    margin: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  itemImage: {
    height: 120,
  },
  itemContent: {
    padding: theme.spacing.sm,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  itemCondition: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: theme.spacing.sm,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  sellerName: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default MarketplaceScreen;
