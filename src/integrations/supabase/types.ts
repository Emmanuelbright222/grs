export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      demo_uploads: {
        Row: {
          artist_name: string | null
          created_at: string
          email: string
          file_url: string | null
          genre: string | null
          id: string
          message: string | null
          name: string
          status: string | null
          user_id: string
        }
        Insert: {
          artist_name?: string | null
          created_at?: string
          email: string
          file_url?: string | null
          genre?: string | null
          id?: string
          message?: string | null
          name: string
          status?: string | null
          user_id: string
        }
        Update: {
          artist_name?: string | null
          created_at?: string
          email?: string
          file_url?: string | null
          genre?: string | null
          id?: string
          message?: string | null
          name?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          artist_name: string | null
          artist_image_url: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          genre: string | null
          id: string
          is_featured: boolean | null
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_name?: string | null
          artist_image_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_name?: string | null
          artist_image_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_demo_submissions: {
        Row: {
          artist_name: string | null
          created_at: string
          email: string
          file_url: string | null
          genre: string | null
          id: string
          message: string | null
          name: string
          status: string | null
        }
        Insert: {
          artist_name?: string | null
          created_at?: string
          email: string
          file_url?: string | null
          genre?: string | null
          id?: string
          message?: string | null
          name: string
          status?: string | null
        }
        Update: {
          artist_name?: string | null
          created_at?: string
          email?: string
          file_url?: string | null
          genre?: string | null
          id?: string
          message?: string | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          artist_name: string | null
          created_at: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_past_event: boolean | null
          location: string
          ticket_url: string | null
          updated_at: string | null
          user_id: string | null
          venue: string | null
          title: string
        }
        Insert: {
          artist_name?: string | null
          created_at?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_past_event?: boolean | null
          location: string
          ticket_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
          title: string
        }
        Update: {
          artist_name?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_past_event?: boolean | null
          location?: string
          ticket_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
          title?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          title: string
          slug: string | null
          excerpt: string | null
          content: string
          featured_image_url: string | null
          category: string | null
          tags: string[] | null
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          view_count: number | null
          author_name: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          title: string
          slug?: string | null
          excerpt?: string | null
          content: string
          featured_image_url?: string | null
          category?: string | null
          tags?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          view_count?: number | null
          author_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          title?: string
          slug?: string | null
          excerpt?: string | null
          content?: string
          featured_image_url?: string | null
          category?: string | null
          tags?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          view_count?: number | null
          author_name?: string | null
        }
        Relationships: []
      }
      releases: {
        Row: {
          apple_music_url: string | null
          artist_name: string
          cover_url: string | null
          created_at: string | null
          description: string | null
          genre: string | null
          id: string
          is_featured: boolean | null
          is_latest_release: boolean | null
          release_date: string | null
          release_type: string | null
          spotify_url: string | null
          streaming_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          youtube_url: string | null
        }
        Insert: {
          apple_music_url?: string | null
          artist_name: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          is_latest_release?: boolean | null
          release_date?: string | null
          release_type?: string | null
          spotify_url?: string | null
          streaming_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          youtube_url?: string | null
        }
        Update: {
          apple_music_url?: string | null
          artist_name?: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          is_latest_release?: boolean | null
          release_date?: string | null
          release_type?: string | null
          spotify_url?: string | null
          streaming_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      streaming_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          platform: string
          revenue: number | null
          streams: number | null
          track_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          platform: string
          revenue?: number | null
          streams?: number | null
          track_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          platform?: string
          revenue?: number | null
          streams?: number | null
          track_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "artist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "artist"],
    },
  },
} as const
