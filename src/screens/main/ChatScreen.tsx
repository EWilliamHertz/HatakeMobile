/**
 * Chat Screen - User-to-User Messaging
 * Direct messaging interface between platform users
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  IconButton,
  Text,
  Appbar,
  Avatar,
  ActivityIndicator,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../contexts/AuthContext';
import {useFirebase} from '../../contexts/FirebaseContext';
import MessageBubble from '../../components/MessageBubble';
import {Message, User, RootStackParamList} from '../../types';
import {theme} from '../../utils/theme';
import NetworkManager from '../../utils/network';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const {user} = useAuth();
  const {firestore, collections, helpers} = useFirebase();

  const {userId: otherUserId, conversationId: existingConversationId} = route.params;

  useEffect(() => {
    if (otherUserId) {
      loadOtherUser();
      loadOrCreateConversation();
    }
  }, [otherUserId]);

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = subscribeToMessages();
      return unsubscribe;
    }
  }, [conversationId]);

  const loadOtherUser = async () => {
    try {
      const userDoc = await firestore
        .collection(collections.users)
        .doc(otherUserId)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data() as User;
        setOtherUser({
          uid: userDoc.id,
          ...userData,
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user information');
    }
  };

  const loadOrCreateConversation = async () => {
    if (!user) return;

    try {
      let convId = existingConversationId;

      if (!convId) {
        // Check if conversation already exists between these users
        const existingConversation = await firestore
          .collection(collections.conversations)
          .where('participants', 'array-contains', user.uid)
          .get();

        const conversation = existingConversation.docs.find(doc => {
          const data = doc.data();
          return data.participants.includes(otherUserId) && data.participants.length === 2;
        });

        if (conversation) {
          convId = conversation.id;
        } else {
          // Create new conversation
          const newConversation = await firestore
            .collection(collections.conversations)
            .add({
              participants: [user.uid, otherUserId],
              createdAt: helpers.timestamp(),
              lastMessage: null,
              lastMessageTime: helpers.timestamp(),
              unreadCount: {
                [user.uid]: 0,
                [otherUserId]: 0,
              },
            });
          convId = newConversation.id;
        }
      }

      setConversationId(convId);
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return () => {};

    return firestore
      .collection(collections.messages)
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const messageList: Message[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          })) as Message[];

          setMessages(messageList.reverse());

          // Mark messages as read
          markMessagesAsRead();

          // Scroll to bottom when new messages arrive
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({animated: true});
          }, 100);
        },
        (error) => {
          console.error('Error subscribing to messages:', error);
        }
      );
  };

  const markMessagesAsRead = async () => {
    if (!user || !conversationId) return;

    try {
      await firestore
        .collection(collections.conversations)
        .doc(conversationId)
        .update({
          [`unreadCount.${user.uid}`]: 0,
        });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user || !conversationId || sending) return;

    if (NetworkManager.isOffline()) {
      Alert.alert('No Connection', 'Please check your internet connection and try again.');
      return;
    }

    setSending(true);
    const messageText = inputText.trim();
    setInputText('');

    try {
      const messageData = {
        conversationId,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderAvatar: user.photoURL || null,
        content: messageText,
        timestamp: helpers.timestamp(),
        type: 'text',
        readBy: [user.uid],
      };

      // Add message to messages collection
      await firestore.collection(collections.messages).add(messageData);

      // Update conversation with last message
      await firestore
        .collection(collections.conversations)
        .doc(conversationId)
        .update({
          lastMessage: messageText,
          lastMessageTime: helpers.timestamp(),
          [`unreadCount.${otherUserId}`]: helpers.increment(1),
        });

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setInputText(messageText); // Restore the message text
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({item}: {item: Message}) => (
    <MessageBubble
      message={item}
      isOwnMessage={item.senderId === user?.uid}
      showAvatar={item.senderId !== user?.uid}
    />
  );

  const getKeyExtractor = (item: Message) => item.id;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <View style={styles.headerContent}>
          <Avatar.Image
            size={32}
            source={
              otherUser?.photoURL
                ? {uri: otherUser.photoURL}
                : undefined
            }
            style={styles.headerAvatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {otherUser?.displayName || 'Unknown User'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {NetworkManager.isOnline() ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <Appbar.Action
          icon="phone"
          onPress={() => Alert.alert('Voice Call', 'Voice calling feature coming soon')}
        />
        <Appbar.Action
          icon="video"
          onPress={() => Alert.alert('Video Call', 'Video calling feature coming soon')}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={getKeyExtractor}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          inverted={false}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({animated: false});
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Start a conversation with {otherUser?.displayName || 'this user'}
              </Text>
              <Text style={styles.emptySubtext}>
                Send a message to begin chatting
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            mode="outlined"
            multiline
            maxLength={1000}
            style={styles.textInput}
            theme={{colors: {primary: theme.colors.primary}}}
            disabled={sending}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <IconButton
            icon="send"
            size={24}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            iconColor={
              !inputText.trim() || sending
                ? theme.colors.onSurface
                : theme.colors.primary
            }
          />
        </View>
      </KeyboardAvoidingView>
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
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.onBackground,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlign: 'center',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: theme.colors.background,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    margin: 0,
    backgroundColor: theme.colors.surface,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;
