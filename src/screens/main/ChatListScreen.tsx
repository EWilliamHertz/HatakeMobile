/**
 * Chat List Screen
 * Shows list of conversations and allows creating new chats
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
  Searchbar,
  List,
  Avatar,
  IconButton,
  Appbar,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../contexts/AuthContext';
import {useFirebase} from '../../contexts/FirebaseContext';
import {Conversation, RootStackParamList} from '../../types';
import {theme} from '../../utils/theme';

type ChatListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ChatListScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const {user} = useAuth();
  const {firestore, collections} = useFirebase();

  const loadConversations = async (showRefreshing = false) => {
    if (!user) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const conversationsSnapshot = await firestore
        .collection(collections.conversations)
        .where('participants', 'array-contains', user.uid)
        .orderBy('lastActivity', 'desc')
        .limit(50)
        .get();

      const loadedConversations: Conversation[] = [];

      for (const doc of conversationsSnapshot.docs) {
        const conversationData = doc.data();
        
        // Get the last message for each conversation
        const lastMessageSnapshot = await firestore
          .collection(collections.messages)
          .where('conversationId', '==', doc.id)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();

        let lastMessage = undefined;
        if (!lastMessageSnapshot.empty) {
          const lastMessageDoc = lastMessageSnapshot.docs[0];
          lastMessage = {
            id: lastMessageDoc.id,
            ...lastMessageDoc.data(),
            timestamp: lastMessageDoc.data().timestamp.toDate(),
          } as any;
        }

        const conversation: Conversation = {
          id: doc.id,
          title: conversationData.title,
          participants: conversationData.participants,
          lastMessage: lastMessage,
          lastActivity: conversationData.lastActivity.toDate(),
          createdAt: conversationData.createdAt.toDate(),
          isAIConversation: conversationData.isAIConversation || false,
          metadata: conversationData.metadata,
        };

        loadedConversations.push(conversation);
      }

      setConversations(loadedConversations);
      setFilteredConversations(loadedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [user])
  );

  const onRefresh = () => {
    loadConversations(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conversation =>
      conversation.title.toLowerCase().includes(query.toLowerCase()) ||
      conversation.lastMessage?.content.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredConversations(filtered);
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const navigateToChat = (conversationId?: string) => {
    navigation.navigate('Chat', {conversationId});
  };

  const createNewChat = () => {
    navigateToChat(); // Navigate without conversationId to create new chat
  };

  const deleteConversation = async (conversationId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all messages in the conversation
              const messagesSnapshot = await firestore
                .collection(collections.messages)
                .where('conversationId', '==', conversationId)
                .get();

              const batch = firestore.batch();
              messagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
              });

              // Delete the conversation
              batch.delete(
                firestore.collection(collections.conversations).doc(conversationId)
              );

              await batch.commit();

              // Remove from local state
              setConversations(prev => prev.filter(conv => conv.id !== conversationId));
              setFilteredConversations(prev => prev.filter(conv => conv.id !== conversationId));
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  const renderConversation = ({item}: {item: Conversation}) => (
    <List.Item
      title={item.title}
      description={
        item.lastMessage
          ? truncateMessage(item.lastMessage.content)
          : 'No messages yet'
      }
      left={() => (
        <Avatar.Icon
          size={48}
          icon={item.isAIConversation ? 'robot' : 'account-group'}
          style={[
            styles.avatar,
            item.isAIConversation ? styles.aiAvatar : styles.groupAvatar,
          ]}
        />
      )}
      right={() => (
        <View style={styles.rightContainer}>
          <Text style={styles.timeText}>
            {formatLastActivity(item.lastActivity)}
          </Text>
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => deleteConversation(item.id)}
          />
        </View>
      )}
      onPress={() => navigateToChat(item.id)}
      style={styles.conversationItem}
    />
  );

  const keyExtractor = (item: Conversation) => item.id;

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Messages" />
        <Appbar.Action icon="refresh" onPress={onRefresh} />
      </Appbar.Header>

      <Searchbar
        placeholder="Search conversations..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
      />

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={keyExtractor}
        style={styles.list}
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
            <Avatar.Icon
              size={64}
              icon="chat"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Start a new chat with Gemini AI or create a group conversation
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={createNewChat}
        label="New Chat"
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
  list: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    borderRadius: 8,
    elevation: 1,
  },
  avatar: {
    marginLeft: theme.spacing.sm,
  },
  aiAvatar: {
    backgroundColor: theme.colors.secondary,
  },
  groupAvatar: {
    backgroundColor: theme.colors.primary,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingRight: theme.spacing.sm,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIcon: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.lg,
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

export default ChatListScreen;
