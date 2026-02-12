// Web-specific TikTok-style Share Sheet
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  contentId: string;
  title: string;
}

interface ShareDestination {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  action: (url: string, title: string) => void;
}

function copyToClipboard(text: string): boolean {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
}

const SHARE_DESTINATIONS: ShareDestination[] = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: 'logo-whatsapp',
    color: '#fff',
    bgColor: '#25D366',
    action: (url, title) =>
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
        '_blank'
      ),
  },
  {
    key: 'twitter',
    label: 'X',
    icon: 'logo-twitter',
    color: '#fff',
    bgColor: '#000',
    action: (url, title) =>
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        '_blank'
      ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: 'logo-facebook',
    color: '#fff',
    bgColor: '#1877F2',
    action: (url) =>
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank'
      ),
  },
  {
    key: 'telegram',
    label: 'Telegram',
    icon: 'paper-plane',
    color: '#fff',
    bgColor: '#0088cc',
    action: (url, title) =>
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        '_blank'
      ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: 'logo-linkedin',
    color: '#fff',
    bgColor: '#0A66C2',
    action: (url) =>
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank'
      ),
  },
  {
    key: 'email',
    label: 'Email',
    icon: 'mail',
    color: '#fff',
    bgColor: '#8e8ea0',
    action: (url, title) =>
      window.open(
        `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check this out: ${url}`)}`,
        '_self'
      ),
  },
];

export function ShareSheet({
  visible,
  onClose,
  contentId,
  title,
}: ShareSheetProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/mobile/video/${contentId}`;

  const handleCopyLink = useCallback(() => {
    if (copyToClipboard(shareUrl)) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, [shareUrl]);

  const handleCopyEmbed = useCallback(() => {
    const embedCode = `<iframe src="${shareUrl}" width="360" height="640" frameborder="0" allowfullscreen></iframe>`;
    if (copyToClipboard(embedCode)) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  }, [shareUrl]);

  const handleDestinationPress = useCallback(
    (dest: ShareDestination) => {
      dest.action(shareUrl, title);
    },
    [shareUrl, title]
  );

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end',
        }}
      >
        {/* Sheet container — stop propagation so tapping sheet doesn't close */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#1a1a2e',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: SCREEN_HEIGHT * 0.6,
            paddingBottom: 20,
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              alignItems: 'center',
              paddingTop: 10,
              paddingBottom: 6,
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
            />
          </View>

          {/* Title */}
          <Text
            style={{
              color: '#f0f0f5',
              fontSize: 15,
              fontWeight: '600',
              textAlign: 'center',
              paddingBottom: 16,
            }}
          >
            Share to
          </Text>

          {/* Share destinations grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 16,
            }}
            style={{ marginBottom: 8 }}
          >
            {/* Copy Link — first item */}
            <TouchableOpacity
              onPress={handleCopyLink}
              activeOpacity={0.7}
              style={{ alignItems: 'center', width: 68 }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: copiedLink
                    ? '#22c55e'
                    : 'rgba(255,255,255,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons
                  name={copiedLink ? 'checkmark' : 'link'}
                  size={24}
                  color="#fff"
                />
              </View>
              <Text
                style={{
                  color: '#c0c0d0',
                  fontSize: 11,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Text>
            </TouchableOpacity>

            {/* Social platforms */}
            {SHARE_DESTINATIONS.map((dest) => (
              <TouchableOpacity
                key={dest.key}
                onPress={() => handleDestinationPress(dest)}
                activeOpacity={0.7}
                style={{ alignItems: 'center', width: 68 }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: dest.bgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name={dest.icon} size={24} color={dest.color} />
                </View>
                <Text
                  style={{
                    color: '#c0c0d0',
                    fontSize: 11,
                    textAlign: 'center',
                  }}
                  numberOfLines={1}
                >
                  {dest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
              marginHorizontal: 16,
              marginVertical: 12,
            }}
          />

          {/* Action items */}
          <View style={{ paddingHorizontal: 16 }}>
            {/* Copy Link action */}
            <TouchableOpacity
              onPress={handleCopyLink}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="link" size={20} color="#c0c0d0" />
              </View>
              <Text style={{ color: '#f0f0f5', fontSize: 14, flex: 1 }}>
                Copy Link
              </Text>
              {copiedLink && (
                <View
                  style={{
                    backgroundColor: '#22c55e',
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    Copied!
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Embed action */}
            <TouchableOpacity
              onPress={handleCopyEmbed}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="code-slash" size={20} color="#c0c0d0" />
              </View>
              <Text style={{ color: '#f0f0f5', fontSize: 14, flex: 1 }}>
                Embed
              </Text>
              {copiedEmbed && (
                <View
                  style={{
                    backgroundColor: '#22c55e',
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    Copied!
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Cancel button */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: '#f0f0f5', fontSize: 15, fontWeight: '500' }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
