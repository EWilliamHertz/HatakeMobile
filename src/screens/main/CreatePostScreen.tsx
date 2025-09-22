/**
 * Create Post Screen
 * Interface for creating new social posts
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

type CreatePostScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreatePost'>;

const CreatePostScreen: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [postType, setPostType] = useState<'text' | 'image' | 'poll' | 'article'>('text');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const {user} = useAuth();
  const {firestore, collections, helpers} = useFirebase();

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
        selectionLimit: 4 - selectedImages.length,
      },
      (response) => {
        if (response.assets) {
          const newImages = response.assets
            .filter(asset => asset.uri)
            .map(asset => asset.uri!);
          setSelectedImages([...selectedImages, ...newImages]);
          if (newImages.length > 0 && postType === 'text') {
            setPostType('image');
          }
        }
      }
    );
  };

  const handleRemoveImage = (imageToRemove: string) => {
    const updatedImages = selectedImages.filter(image => image !== imageToRemove);
    setSelectedImages(updatedImages);
    if (updatedImages.length === 0 && postType === 'image') {
      setPostType('text');
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadPromises = selectedImages.map(async (imageUri, index) => {
      const fileName = `post_${Date.now()}_${index}.jpg`;
      return await helpers.uploadFile(imageUri, fileName, 'posts');
    });

    return await Promise.all(uploadPromises);
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    setLoading(true);
    try {
      // Upload images if any
      const imageUrls = await uploadImages();

      // Create post object
      const postData = {
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || null,
        timestamp: helpers.timestamp(),
        likes: [],
        comments: [],
        shares: 0,
        images: imageUrls,
        type: postType,
        visibility: visibility,
        tags: tags,
      };

      // Save post to Firestore
      const postRef = await firestore
        .collection(collections.posts)
        .add(postData);

      Alert.alert(
        'Success',
        'Your post has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIPost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter a topic or prompt for AI generation');
      return;
    }

    setLoading(true);
    try {
      // This would call your Gemini AI function to generate content
      Alert.alert('AI Generation', 'AI post generation feature coming soon');
    } catch (error) {
      console.error('Error generating AI post:', error);
      Alert.alert('Error', 'Failed to generate AI post');
    } finally {
      setLoading(false);
    }
  };

  const postTypeOptions = [
    {key: 'text', label: 'Text', icon: 'text'},
    {key: 'image', label: 'Image', icon: 'image'},
    {key: 'poll', label: 'Poll', icon: 'poll'},
    {key: 'article', label: 'Article', icon: 'file-document'},
  ];

  const visibilityOptions = [
    {key: 'public', label: 'Public', icon: 'earth'},
    {key: 'followers', label: 'Followers', icon: 'account-group'},
    {key: 'private', label: 'Private', icon: 'lock'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Post" />
        <Appbar.Action
          icon="robot"
          onPress={handleGenerateAIPost}
          disabled={loading}
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Content Input */}
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="What's on your mind?"
              value={content}
              onChangeText={setContent}
              mode="outlined"
              multiline
              numberOfLines={6}
              maxLength={2000}
              style={styles.contentInput}
              theme={{colors: {primary: theme.colors.primary}}}
              disabled={loading}
            />
            <Text style={styles.characterCount}>
              {content.length}/2000 characters
            </Text>
          </Card.Content>
        </Card>

        {/* Post Type Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Post Type</Text>
            <View style={styles.optionsContainer}>
              {postTypeOptions.map((option) => (
                <Chip
                  key={option.key}
                  selected={postType === option.key}
                  onPress={() => setPostType(option.key as any)}
                  icon={option.icon}
                  style={[
                    styles.optionChip,
                    postType === option.key && styles.selectedChip,
                  ]}
                  disabled={loading}>
                  {option.label}
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
                disabled={loading || selectedImages.length >= 4}
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
              You can add up to 4 images to your post
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

        {/* Visibility */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Visibility</Text>
            <View style={styles.optionsContainer}>
              {visibilityOptions.map((option) => (
                <Chip
                  key={option.key}
                  selected={visibility === option.key}
                  onPress={() => setVisibility(option.key as any)}
                  icon={option.icon}
                  style={[
                    styles.optionChip,
                    visibility === option.key && styles.selectedChip,
                  ]}
                  disabled={loading}>
                  {option.label}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Create Button */}
        <View style={styles.createButtonContainer}>
          <Button
            mode="contained"
            onPress={handleCreatePost}
            loading={loading}
            disabled={!content.trim() || loading}
            style={styles.createButton}
            contentStyle={styles.createButtonContent}>
            {loading ? 'Creating Post...' : 'Create Post'}
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
  contentInput: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
    textAlign: 'right',
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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

export default CreatePostScreen;
