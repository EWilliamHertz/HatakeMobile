/**
 * Message Bubble Component
 * Renders individual chat messages with different styles for user/AI messages
 */

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Avatar, Card} from 'react-native-paper';
import {Message} from '../types';
import {theme} from '../utils/theme';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({message, currentUserId}) => {
  const isUserMessage = message.senderId === currentUserId;
  const isAIMessage = message.type === 'ai';
  const isSystemMessage = message.type === 'system';

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBubbleStyle = () => {
    if (isSystemMessage) {
      return [styles.bubble, styles.systemBubble];
    }
    if (isUserMessage) {
      return [styles.bubble, styles.userBubble];
    }
    return [styles.bubble, styles.aiBubble];
  };

  const getTextColor = () => {
    if (isSystemMessage) return theme.colors.onSecondary;
    if (isUserMessage) return theme.colors.onPrimary;
    return theme.colors.onSurface;
  };

  const getAvatarSource = () => {
    if (message.senderAvatar) {
      return {uri: message.senderAvatar};
    }
    return undefined;
  };

  const getAvatarIcon = () => {
    if (isAIMessage) return 'robot';
    if (isSystemMessage) return 'information';
    return 'account';
  };

  if (isSystemMessage) {
    return (
      <View style={styles.systemContainer}>
        <Card style={styles.systemCard}>
          <Card.Content style={styles.systemContent}>
            <Text style={[styles.messageText, {color: getTextColor()}]}>
              {message.content}
            </Text>
            <Text style={styles.systemTime}>
              {formatTime(message.timestamp)}
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUserMessage ? styles.userContainer : styles.otherContainer]}>
      {!isUserMessage && (
        <Avatar.Icon
          size={32}
          icon={getAvatarIcon()}
          style={[
            styles.avatar,
            isAIMessage ? styles.aiAvatar : styles.userAvatar,
          ]}
        />
      )}
      
      <View style={styles.bubbleContainer}>
        {!isUserMessage && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        
        <Card style={getBubbleStyle()}>
          <Card.Content style={styles.bubbleContent}>
            <Text style={[styles.messageText, {color: getTextColor()}]}>
              {message.content}
            </Text>
            
            <View style={styles.messageFooter}>
              <Text style={[styles.timestamp, {color: getTextColor()}]}>
                {formatTime(message.timestamp)}
              </Text>
              
              {message.metadata && (
                <View style={styles.metadata}>
                  {message.metadata.model && (
                    <Text style={[styles.metadataText, {color: getTextColor()}]}>
                      {message.metadata.model}
                    </Text>
                  )}
                  {message.metadata.tokens && (
                    <Text style={[styles.metadataText, {color: getTextColor()}]}>
                      {message.metadata.tokens} tokens
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>
      
      {isUserMessage && (
        <Avatar.Icon
          size={32}
          icon="account"
          style={styles.userAvatar}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginTop: theme.spacing.xs,
  },
  aiAvatar: {
    backgroundColor: theme.colors.secondary,
  },
  userAvatar: {
    backgroundColor: theme.colors.primary,
  },
  bubbleContainer: {
    flex: 1,
    maxWidth: '80%',
    marginHorizontal: theme.spacing.sm,
  },
  senderName: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
    opacity: 0.7,
  },
  bubble: {
    borderRadius: 16,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: theme.colors.userMessage,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
  },
  systemBubble: {
    backgroundColor: theme.colors.secondary,
  },
  bubbleContent: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  metadata: {
    alignItems: 'flex-end',
  },
  metadataText: {
    fontSize: 10,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  systemCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    maxWidth: '70%',
  },
  systemContent: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  systemTime: {
    fontSize: 10,
    color: theme.colors.onSecondary,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
});

export default MessageBubble;
