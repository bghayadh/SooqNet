import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTranslation } from 'react-i18next';

const ItemVideo = ({ videos, isRTL, basePath }) => {
  const { t } = useTranslation();
  const video = videos?.[0];
  const source = video?.videoName
    ? (video.videoPath?.startsWith('http')
      ? `${video.videoPath.replace(/\/+$/, '')}/${video.videoName}`
      : `${(basePath || '').replace(/\/+$/, '')}/${video.videoName}`)
    : null;
  const player = useVideoPlayer(source);

  if (!source) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
        {t('productVideo')}
      </Text>
      <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  video: { width: '100%', height: 220, backgroundColor: '#111', borderRadius: 8 },
});

export default ItemVideo;
