import { create } from 'zustand';
import type { Comment } from '@/types';

interface SocialState {
  likes: Record<string, boolean>; // contentId -> liked
  likeCounts: Record<string, number>; // contentId -> count
  commentCounts: Record<string, number>; // contentId -> count
  comments: Record<string, Comment[]>; // contentId -> comments
  following: Record<string, boolean>; // userId -> following

  toggleLike: (contentId: string) => void;
  setLikeCount: (contentId: string, count: number) => void;
  setComments: (contentId: string, comments: Comment[]) => void;
  addComment: (contentId: string, comment: Comment) => void;
  setCommentCount: (contentId: string, count: number) => void;
  toggleFollow: (userId: string) => void;
  setFollowing: (userId: string, isFollowing: boolean) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  likes: {},
  likeCounts: {},
  commentCounts: {},
  comments: {},
  following: {},

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
}));
