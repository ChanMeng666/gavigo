// Supabase Database Types (manually defined to match schema)
// Regenerate with: npx supabase gen types typescript --project-id <ref>

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string;
          followers_count: number;
          following_count: number;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string;
          followers_count?: number;
          following_count?: number;
          likes_count?: number;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          bio?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          pexels_id: number | null;
          content_type: string;
          slug: string | null;
          title: string;
          description: string;
          theme: string;
          video_url: string;
          thumbnail_url: string;
          duration: number;
          photographer: string;
          photographer_url: string;
          width: number;
          height: number;
          like_count: number;
          comment_count: number;
          view_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          pexels_id?: number | null;
          content_type?: string;
          slug?: string | null;
          title: string;
          description?: string;
          theme: string;
          video_url: string;
          thumbnail_url: string;
          duration?: number;
          photographer?: string;
          photographer_url?: string;
          width?: number;
          height?: number;
        };
        Update: {
          title?: string;
          description?: string;
          theme?: string;
          video_url?: string;
          thumbnail_url?: string;
          is_active?: boolean;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          content_id: string;
        };
        Update: never;
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          content_id: string;
          text: string;
        };
        Update: never;
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
        };
        Update: never;
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
        };
        Update: never;
      };
      view_history: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          watch_duration_ms: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          content_id: string;
          watch_duration_ms?: number;
        };
        Update: {
          watch_duration_ms?: number;
        };
      };
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Video = Database['public']['Tables']['videos']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type CommentRow = Database['public']['Tables']['comments']['Row'];
export type Follow = Database['public']['Tables']['follows']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type ViewHistory = Database['public']['Tables']['view_history']['Row'];
