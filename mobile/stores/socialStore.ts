import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { appStorage } from '@/services/storage';
import type { Comment } from '@/types';

interface SocialState {
  likes: Record<string, boolean>; // contentId -> liked
  likeCounts: Record<string, number>; // contentId -> count
  commentCounts: Record<string, number>; // contentId -> count
  comments: Record<string, Comment[]>; // contentId -> comments
  following: Record<string, boolean>; // userId -> following
  hiddenConversationIds: string[]; // soft-deleted conversation IDs

  toggleLike: (contentId: string) => void;
  setLikeCount: (contentId: string, count: number) => void;
  initLikeCount: (contentId: string, count: number) => void;
  initCommentCount: (contentId: string, count: number) => void;
  setComments: (contentId: string, comments: Comment[]) => void;
  addComment: (contentId: string, comment: Comment) => void;
  setCommentCount: (contentId: string, count: number) => void;
  toggleFollow: (userId: string) => void;
  setFollowing: (userId: string, isFollowing: boolean) => void;
  hideConversation: (conversationId: string) => void;
}

const zustandStorage = createJSONStorage(() => ({
  getItem: (key: string) => appStorage.getItem(key),
  setItem: (key: string, value: string) => appStorage.setItem(key, value),
  removeItem: (key: string) => appStorage.removeItem(key),
}));

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
  likes: {},
  likeCounts: {},
  commentCounts: {},
  comments: {},
  following: {},
  hiddenConversationIds: [],

  toggleLike: (contentId) =>
    set((state) => {
      const wasLiked = state.likes[contentId] ?? false;
      const currentCount = state.likeCounts[contentId] ?? 0;
      return {
        likes: { ...state.likes, [contentId]: !wasLiked },
        likeCounts: {
          ...state.likeCounts,
          [contentId]: wasLiked ? currentCount - 1 : currentCount + 1,
        },
      };
    }),

  setLikeCount: (contentId, count) =>
    set((state) => ({
      likeCounts: { ...state.likeCounts, [contentId]: count },
    })),

  initLikeCount: (contentId, count) =>
    set((state) => {
      if (contentId in state.likeCounts) return state;
      return { likeCounts: { ...state.likeCounts, [contentId]: count } };
    }),

  initCommentCount: (contentId, count) =>
    set((state) => {
      if (contentId in state.commentCounts) return state;
      return { commentCounts: { ...state.commentCounts, [contentId]: count } };
    }),

  setComments: (contentId, comments) =>
    set((state) => ({
      comments: { ...state.comments, [contentId]: comments },
      commentCounts: { ...state.commentCounts, [contentId]: comments.length },
    })),

  addComment: (contentId, comment) =>
    set((state) => {
      const existing = state.comments[contentId] ?? [];
      return {
        comments: { ...state.comments, [contentId]: [...existing, comment] },
        commentCounts: {
          ...state.commentCounts,
          [contentId]: existing.length + 1,
        },
      };
    }),

  setCommentCount: (contentId, count) =>
    set((state) => ({
      commentCounts: { ...state.commentCounts, [contentId]: count },
    })),

  toggleFollow: (userId) =>
    set((state) => ({
      following: { ...state.following, [userId]: !state.following[userId] },
    })),

  setFollowing: (userId, isFollowing) =>
    set((state) => ({
      following: { ...state.following, [userId]: isFollowing },
    })),

  hideConversation: (conversationId) =>
    set((state) => ({
      hiddenConversationIds: state.hiddenConversationIds.includes(conversationId)
        ? state.hiddenConversationIds
        : [...state.hiddenConversationIds, conversationId],
    })),
    }),
    {
      name: 'social-store',
      storage: zustandStorage,
      partialize: (state) => ({
        hiddenConversationIds: state.hiddenConversationIds,
      }),
    }
  )
);
