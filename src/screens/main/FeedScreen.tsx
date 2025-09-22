/**
 * Feed Screen
 * Main social feed showing posts from users and the community
 */

import React, {useState, useEffect, useCallback} from 'react';
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
  Appbar,
  Searchbar,
  Chip,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../contexts/AuthContext';
import {useFirebase} from '../../contexts/FirebaseContext';
import PostCard from '../../components/PostCard';
import {Post, RootStackParamList} from '../../types';
import {theme} from '../../utils/theme';

type FeedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const navigation = useNavigation<FeedScreenNavigationProp>();
  const {user} = useAuth();
  const {firestore, collections} = useFirebase();

  const filters = [
    {key: 'all', label: 'All Posts'},
    {key: 'following', label: 'Following'},
    {key: 'ai', label: 'AI Generated'},
    {key: 'articles', label: 'Articles'},
    {key: 'marketplace', label: 'Marketplace'},
  ];

  const loadPosts = async (showRefreshing = false) => {
    if (!user) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      let query = firestore
        .collection(collections.posts)
        .where('visibility', 'in', ['public', 'followers'])
        .orderBy('timestamp', 'desc')
        .limit(50);

      // Apply filter
      if (selectedFilter === 'following') {
        // Get user's following list first
        const userDoc = await firestore
          .collection(collections.users)
          .doc(user.uid)
          .get();
        
        const userData = userDoc.data();
        const following = userData?.following || [];
        
        if (following.length > 0) {
          query = firestore
            .collection(collections.posts)
            .where('authorId', 'in', following.slice(0, 10)) // Firestore 'in' limit
            .orderBy('timestamp', 'desc')
            .limit(50);
        } else {
          setPosts([]);
          setFilteredPosts([]);
          return;
        }
      } else if (selectedFilter === 'ai') {
        query = firestore
          .collection(collections.posts)
          .where('type', '==', 'ai-generated')
          .where('visibility', 'in', ['public', 'followers'])
          .orderBy('timestamp', 'desc')
          .limit(50);
      } else if (selectedFilter === 'articles') {
        query = firestore
          .collection(collections.posts)
          .where('type', '==', 'article')
          .where('visibility', 'in', ['public', 'followers'])
          .orderBy('timestamp', 'desc')
          .limit(50);
      }

      const postsSnapshot = await query.get();

      const loadedPosts: Post[] = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Post[];

      setPosts(loadedPosts);
      applySearchFilter(loadedPosts, searchQuery);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applySearchFilter = (postsToFilter: Post[], query: string) => {
    if (!query.trim()) {
      setFilteredPosts(postsToFilter);
      return;
    }

    const filtered = postsToFilter.filter(post =>
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.authorName.toLowerCase().includes(query.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredPosts(filtered);
  };

  // Load posts when screen comes into focus or filter changes
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [user, selectedFilter])
  );

  const onRefresh = () => {
    loadPosts(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applySearchFilter(posts, query);
  };

  const handleFilterChange = (filterKey: string) => {
    setSelectedFilter(filterKey);
  };

  const navigateToCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handleLikePost = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      const postRef = firestore.collection(collections.posts).doc(postId);
      
      if (isLiked) {
        // Remove like
        await postRef.update({
          likes: firestore.FieldValue.arrayRemove(user.uid),
        });
      } else {
        // Add like
        await postRef.update({
          likes: firestore.FieldValue.arrayUnion(user.uid),
        });
      }

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const updatedLikes = isLiked
              ? post.likes.filter(id => id !== user.uid)
              : [...post.likes, user.uid];
            return {...post, likes: updatedLikes};
          }
          return post;
        })
      );

      setFilteredPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const updatedLikes = isLiked
              ? post.likes.filter(id => id !== user.uid)
              : [...post.likes, user.uid];
            return {...post, likes: updatedLikes};
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error updating like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleSharePost = (post: Post) => {
    // Implement share functionality
    Alert.alert('Share', `Sharing: ${post.content.substring(0, 50)}...`);
  };

  const renderPost = ({item}: {item: Post}) => (
    <PostCard
      post={item}
      currentUserId={user?.uid || ''}
      onLike={handleLikePost}
      onShare={handleSharePost}
    />
  );

  const renderFilter = (filter: {key: string; label: string}) => (
    <Chip
      key={filter.key}
      selected={selectedFilter === filter.key}
      onPress={() => handleFilterChange(filter.key)}
      style={[
        styles.filterChip,
        selectedFilter === filter.key && styles.selectedFilterChip,
      ]}
      textStyle={[
        styles.filterChipText,
        selectedFilter === filter.key && styles.selectedFilterChipText,
      ]}>
      {filter.label}
    </Chip>
  );

  const keyExtractor = (item: Post) => item.id;

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="GeminiHatake" />
        <Appbar.Action icon="bell" onPress={() => {}} />
      </Appbar.Header>

      <Searchbar
        placeholder="Search posts..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
      />

      <View style={styles.filtersContainer}>
        <FlatList
          data={filters}
          renderItem={({item}) => renderFilter(item)}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
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
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'following'
                ? "Follow some users to see their posts here"
                : searchQuery
                ? "Try adjusting your search terms"
                : "Be the first to share something with the community!"}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={navigateToCreatePost}
        label="Post"
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
  filtersContainer: {
    paddingVertical: theme.spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: theme.spacing.md,
  },
  filterChip: {
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  selectedFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.onSurface,
  },
  selectedFilterChipText: {
    color: theme.colors.onPrimary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
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

export default FeedScreen;
