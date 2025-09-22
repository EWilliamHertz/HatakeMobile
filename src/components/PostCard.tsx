/**
 * Post Card Component
 * Displays individual social posts with like, comment, and share functionality
 */

import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {
  Card,
  Text,
  Avatar,
  IconButton,
  Chip,
  Button,
} from 'react-native-paper';
import {Post} from '../types';
import {theme} from '../utils/theme';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: (postId: string, isLiked: boolean) => void;
  onShare: (post: Post) => void;
  onComment?: (post: Post) => void;
  onUserPress?: (userId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onShare,
  onComment,
  onUserPress,
}) => {
  const isLiked = post.likes.includes(currentUserId);
  const likeCount = post.likes.length;
  const commentCount = post.comments.length;

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'ai-generated':
        return theme.colors.secondary;
      case 'article':
        return theme.colors.accent;
      case 'poll':
        return theme.colors.warning;
      case 'image':
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'ai-generated':
        return 'AI Generated';
      case 'article':
        return 'Article';
      case 'poll':
        return 'Poll';
      case 'image':
        return 'Image Post';
      default:
        return 'Text Post';
    }
  };

  const handleUserPress = () => {
    if (onUserPress) {
      onUserPress(post.authorId);
    }
  };

  const handleLike = () => {
    onLike(post.id, isLiked);
  };

  const handleComment = () => {
    if (onComment) {
      onComment(post);
    }
  };

  const handleShare = () => {
    onShare(post);
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Image
              size={40}
              source={
                post.authorAvatar
                  ? {uri: post.authorAvatar}
                  : undefined
              }
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text
                style={styles.authorName}
                onPress={handleUserPress}>
                {post.authorName}
              </Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(post.timestamp)}
              </Text>
            </View>
          </View>
          
          {post.type !== 'text' && (
            <Chip
              mode="outlined"
              style={[styles.typeChip, {borderColor: getPostTypeColor(post.type)}]}
              textStyle={[styles.typeChipText, {color: getPostTypeColor(post.type)}]}>
              {getPostTypeLabel(post.type)}
            </Chip>
          )}
        </View>

        {/* Content */}
        <Text style={styles.content}>{post.content}</Text>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {post.images.slice(0, 4).map((imageUrl, index) => (
              <Image
                key={index}
                source={{uri: imageUrl}}
                style={[
                  styles.postImage,
                  post.images!.length === 1 && styles.singleImage,
                  post.images!.length === 2 && styles.doubleImage,
                  post.images!.length > 2 && styles.multipleImage,
                ]}
                resizeMode="cover"
              />
            ))}
            {post.images.length > 4 && (
              <View style={[styles.postImage, styles.multipleImage, styles.moreImagesOverlay]}>
                <Text style={styles.moreImagesText}>+{post.images.length - 4}</Text>
              </View>
            )}
          </View>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.tagChip}
                textStyle={styles.tagChipText}>
                #{tag}
              </Chip>
            ))}
            {post.tags.length > 3 && (
              <Text style={styles.moreTags}>+{post.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </Card.Content>

      {/* Actions */}
      <Card.Actions style={styles.actions}>
        <View style={styles.actionButtons}>
          <Button
            mode="text"
            icon={isLiked ? 'heart' : 'heart-outline'}
            onPress={handleLike}
            textColor={isLiked ? theme.colors.error : theme.colors.onSurface}
            style={styles.actionButton}>
            {likeCount > 0 ? likeCount.toString() : 'Like'}
          </Button>

          <Button
            mode="text"
            icon="comment-outline"
            onPress={handleComment}
            textColor={theme.colors.onSurface}
            style={styles.actionButton}>
            {commentCount > 0 ? commentCount.toString() : 'Comment'}
          </Button>

          <Button
            mode="text"
            icon="share-outline"
            onPress={handleShare}
            textColor={theme.colors.onSurface}
            style={styles.actionButton}>
            Share
          </Button>
        </View>

        {post.shares > 0 && (
          <Text style={styles.shareCount}>{post.shares} shares</Text>
        )}
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  cardContent: {
    paddingBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  userDetails: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginTop: 2,
  },
  typeChip: {
    height: 28,
    backgroundColor: 'transparent',
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  singleImage: {
    width: '100%',
    height: 200,
  },
  doubleImage: {
    width: '49%',
    height: 150,
    marginRight: '2%',
  },
  multipleImage: {
    width: '49%',
    height: 100,
    marginRight: '2%',
    marginBottom: '2%',
  },
  moreImagesOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tagChip: {
    height: 24,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
  },
  tagChipText: {
    fontSize: 11,
    color: theme.colors.primary,
  },
  moreTags: {
    fontSize: 11,
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginLeft: theme.spacing.xs,
  },
  actions: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  actionButton: {
    marginRight: theme.spacing.md,
  },
  shareCount: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
  },
});

export default PostCard;
