/**
 * Profile Screen
 * User profile with posts, followers, and settings
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Appbar,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../contexts/AuthContext';
import {useFirebase} from '../../contexts/FirebaseContext';
import {User, Post, RootStackParamList} from '../../types';
import {theme} from '../../utils/theme';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });

  const route = useRoute<ProfileScreenRouteProp>();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const {user: currentUser, signOut} = useAuth();
  const {firestore, collections} = useFirebase();

  const userId = route.params?.userId || currentUser?.uid;
  const isOwnProfile = userId === currentUser?.uid;

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async (showRefreshing = false) => {
    if (!userId) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load user profile
      const userDoc = await firestore
        .collection(collections.users)
        .doc(userId)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data() as User;
        setProfileUser({
          uid: userDoc.id,
          ...userData,
        });

        // Calculate stats
        const followers = userData.followers || [];
        const following = userData.following || [];
        
        setStats(prev => ({
          ...prev,
          followers: followers.length,
          following: following.length,
        }));

        // Check if current user is following this profile
        if (currentUser && !isOwnProfile) {
          setIsFollowing(followers.includes(currentUser.uid));
        }
      }

      // Load user posts
      const postsSnapshot = await firestore
        .collection(collections.posts)
        .where('authorId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

      const posts: Post[] = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Post[];

      setUserPosts(posts);
      setStats(prev => ({
        ...prev,
        posts: posts.length,
      }));

    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadProfile(true);
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser || isOwnProfile) return;

    try {
      const currentUserRef = firestore.collection(collections.users).doc(currentUser.uid);
      const profileUserRef = firestore.collection(collections.users).doc(profileUser.uid);

      if (isFollowing) {
        // Unfollow
        await currentUserRef.update({
          following: firestore.FieldValue.arrayRemove(profileUser.uid),
        });
        await profileUserRef.update({
          followers: firestore.FieldValue.arrayRemove(currentUser.uid),
        });
        setIsFollowing(false);
        setStats(prev => ({...prev, followers: prev.followers - 1}));
      } else {
        // Follow
        await currentUserRef.update({
          following: firestore.FieldValue.arrayUnion(profileUser.uid),
        });
        await profileUserRef.update({
          followers: firestore.FieldValue.arrayUnion(currentUser.uid),
        });
        setIsFollowing(true);
        setStats(prev => ({...prev, followers: prev.followers + 1}));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        {!isOwnProfile && <Appbar.BackAction onPress={() => navigation.goBack()} />}
        <Appbar.Content title={isOwnProfile ? 'Profile' : profileUser.displayName || 'Profile'} />
        {isOwnProfile && <Appbar.Action icon="cog" onPress={navigateToSettings} />}
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }>
        
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Avatar.Image
                size={80}
                source={
                  profileUser.photoURL
                    ? {uri: profileUser.photoURL}
                    : undefined
                }
                style={styles.profileAvatar}
              />
              
              <View style={styles.profileInfo}>
                <Text style={styles.displayName}>
                  {profileUser.displayName || 'Anonymous User'}
                </Text>
                {profileUser.bio && (
                  <Text style={styles.bio}>{profileUser.bio}</Text>
                )}
                {profileUser.location && (
                  <Text style={styles.location}>📍 {profileUser.location}</Text>
                )}
                {profileUser.createdAt && (
                  <Text style={styles.joinDate}>
                    Joined {formatJoinDate(profileUser.createdAt)}
                  </Text>
                )}
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {isOwnProfile ? (
                <>
                  <Button
                    mode="outlined"
                    onPress={() => {}}
                    style={styles.actionButton}>
                    Edit Profile
                  </Button>
                  <Button
                    mode="text"
                    onPress={handleSignOut}
                    textColor={theme.colors.error}
                    style={styles.actionButton}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    mode={isFollowing ? 'outlined' : 'contained'}
                    onPress={handleFollowToggle}
                    style={styles.actionButton}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {}}
                    style={styles.actionButton}>
                    Message
                  </Button>
                </>
              )}
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        {/* Recent Posts */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <Card key={post.id} style={styles.postCard}>
                <Card.Content>
                  <Text style={styles.postContent} numberOfLines={3}>
                    {post.content}
                  </Text>
                  <Text style={styles.postDate}>
                    {post.timestamp.toLocaleDateString()}
                  </Text>
                  <View style={styles.postStats}>
                    <Text style={styles.postStat}>
                      ❤️ {post.likes.length}
                    </Text>
                    <Text style={styles.postStat}>
                      💬 {post.comments.length}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.noPostsText}>
              {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
            </Text>
          )}
        </View>

        {/* Additional Profile Sections */}
        {isOwnProfile && (
          <>
            <Divider style={styles.divider} />
            
            <View style={styles.menuSection}>
              <List.Item
                title="My Listings"
                description="Items you're selling"
                left={() => <List.Icon icon="store" />}
                right={() => <List.Icon icon="chevron-right" />}
                onPress={() => {}}
                style={styles.menuItem}
              />
              <List.Item
                title="Trading History"
                description="Your completed trades"
                left={() => <List.Icon icon="swap-horizontal" />}
                right={() => <List.Icon icon="chevron-right" />}
                onPress={() => {}}
                style={styles.menuItem}
              />
              <List.Item
                title="Saved Posts"
                description="Posts you've bookmarked"
                left={() => <List.Icon icon="bookmark" />}
                right={() => <List.Icon icon="chevron-right" />}
                onPress={() => {}}
                style={styles.menuItem}
              />
            </View>
          </>
        )}
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
  loadingText: {
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
    color: theme.colors.onBackground,
  },
  profileCard: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  profileContent: {
    padding: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  profileAvatar: {
    backgroundColor: theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  bio: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  location: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: theme.spacing.xs,
  },
  joinDate: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.outline,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  postsSection: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.md,
  },
  postCard: {
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  postContent: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  postDate: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginBottom: theme.spacing.xs,
  },
  postStats: {
    flexDirection: 'row',
  },
  postStat: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginRight: theme.spacing.md,
  },
  noPostsText: {
    textAlign: 'center',
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
  },
  menuSection: {
    paddingHorizontal: theme.spacing.md,
  },
  menuItem: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xs,
    borderRadius: 8,
  },
});

export default ProfileScreen;
