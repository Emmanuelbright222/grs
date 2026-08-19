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
      bank_details: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      distrokid_account: {
        Row: {
          account_email: string
          account_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_email: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_email?: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
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
          title: string
          updated_at: string | null
          user_id: string | null
          venue: string | null
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
          title: string
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
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
          title?: string
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      heartbeat_log: {
        Row: {
          id: number
          ran_at: string | null
        }
        Insert: {
          id?: number
          ran_at?: string | null
        }
        Update: {
          id?: number
          ran_at?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author_name: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apple_music_url: string | null
          artist_image_url: string | null
          artist_name: string | null
          audiomack_url: string | null
          avatar_url: string | null
          bio: string | null
          boomplay_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          genre: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          phone_number: string | null
          spotify_url: string | null
          updated_at: string
          user_id: string | null
          youtube_music_url: string | null
        }
        Insert: {
          apple_music_url?: string | null
          artist_image_url?: string | null
          artist_name?: string | null
          audiomack_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          boomplay_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          phone_number?: string | null
          spotify_url?: string | null
          updated_at?: string
          user_id?: string | null
          youtube_music_url?: string | null
        }
        Update: {
          apple_music_url?: string | null
          artist_image_url?: string | null
          artist_name?: string | null
          audiomack_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          boomplay_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          phone_number?: string | null
          spotify_url?: string | null
          updated_at?: string
          user_id?: string | null
          youtube_music_url?: string | null
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
      releases: {
        Row: {
          apple_music_url: string | null
          artist_name: string
          audiomack_url: string | null
          boomplay_url: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          distrokid_dashboard_url: string | null
          distrokid_live_at: string | null
          distrokid_release_id: string | null
          distrokid_status: string | null
          distrokid_submitted_at: string | null
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
          youtube_music_url: string | null
          youtube_url: string | null
        }
        Insert: {
          apple_music_url?: string | null
          artist_name: string
          audiomack_url?: string | null
          boomplay_url?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          distrokid_dashboard_url?: string | null
          distrokid_live_at?: string | null
          distrokid_release_id?: string | null
          distrokid_status?: string | null
          distrokid_submitted_at?: string | null
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
          youtube_music_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          apple_music_url?: string | null
          artist_name?: string
          audiomack_url?: string | null
          boomplay_url?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          distrokid_dashboard_url?: string | null
          distrokid_live_at?: string | null
          distrokid_release_id?: string | null
          distrokid_status?: string | null
          distrokid_submitted_at?: string | null
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
          youtube_music_url?: string | null
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
      streaming_platform_connections: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          platform: string
          platform_user_id: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform: string
          platform_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform?: string
          platform_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
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
      admin_create_profile:
        | {
            Args: {
              p_apple_music_url?: string
              p_artist_image_url?: string
              p_artist_name: string
              p_audiomack_url?: string
              p_avatar_url?: string
              p_bio?: string
              p_boomplay_url?: string
              p_email: string
              p_full_name: string
              p_genre?: string
              p_is_approved?: boolean
              p_is_featured?: boolean
              p_phone_number?: string
              p_spotify_url?: string
              p_youtube_music_url?: string
            }
            Returns: {
              apple_music_url: string | null
              artist_image_url: string | null
              artist_name: string | null
              audiomack_url: string | null
              avatar_url: string | null
              bio: string | null
              boomplay_url: string | null
              created_at: string
              email: string | null
              full_name: string | null
              gender: string | null
              genre: string | null
              id: string
              is_approved: boolean | null
              is_featured: boolean | null
              phone_number: string | null
              spotify_url: string | null
              updated_at: string
              user_id: string | null
              youtube_music_url: string | null
            }
            SetofOptions: {
              from: "*"
              to: "profiles"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              p_artist_image_url?: string
              p_artist_name: string
              p_avatar_url?: string
              p_bio?: string
              p_email: string
              p_full_name: string
              p_genre?: string
              p_is_approved?: boolean
              p_is_featured?: boolean
              p_phone_number?: string
            }
            Returns: {
              apple_music_url: string | null
              artist_image_url: string | null
              artist_name: string | null
              audiomack_url: string | null
              avatar_url: string | null
              bio: string | null
              boomplay_url: string | null
              created_at: string
              email: string | null
              full_name: string | null
              gender: string | null
              genre: string | null
              id: string
              is_approved: boolean | null
              is_featured: boolean | null
              phone_number: string | null
              spotify_url: string | null
              updated_at: string
              user_id: string | null
              youtube_music_url: string | null
            }
            SetofOptions: {
              from: "*"
              to: "profiles"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              p_apple_music_url?: string
              p_artist_image_url?: string
              p_artist_name: string
              p_audiomack_url?: string
              p_avatar_url?: string
              p_bio?: string
              p_boomplay_url?: string
              p_email: string
              p_full_name: string
              p_gender?: string
              p_genre?: string
              p_is_approved?: boolean
              p_is_featured?: boolean
              p_phone_number?: string
              p_spotify_url?: string
              p_youtube_music_url?: string
            }
            Returns: {
              apple_music_url: string | null
              artist_image_url: string | null
              artist_name: string | null
              audiomack_url: string | null
              avatar_url: string | null
              bio: string | null
              boomplay_url: string | null
              created_at: string
              email: string | null
              full_name: string | null
              gender: string | null
              genre: string | null
              id: string
              is_approved: boolean | null
              is_featured: boolean | null
              phone_number: string | null
              spotify_url: string | null
              updated_at: string
              user_id: string | null
              youtube_music_url: string | null
            }
            SetofOptions: {
              from: "*"
              to: "profiles"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      create_or_update_profile:
        | {
            Args: {
              p_artist_name: string
              p_email: string
              p_full_name: string
              p_gender?: string
              p_genre: string
              p_phone_number?: string
              p_user_id: string
            }
            Returns: {
              apple_music_url: string | null
              artist_image_url: string | null
              artist_name: string | null
              audiomack_url: string | null
              avatar_url: string | null
              bio: string | null
              boomplay_url: string | null
              created_at: string
              email: string | null
              full_name: string | null
              gender: string | null
              genre: string | null
              id: string
              is_approved: boolean | null
              is_featured: boolean | null
              phone_number: string | null
              spotify_url: string | null
              updated_at: string
              user_id: string | null
              youtube_music_url: string | null
            }
            SetofOptions: {
              from: "*"
              to: "profiles"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              p_artist_name: string
              p_email: string
              p_full_name: string
              p_genre: string
              p_phone_number?: string
              p_user_id: string
            }
            Returns: {
              apple_music_url: string | null
              artist_image_url: string | null
              artist_name: string | null
              audiomack_url: string | null
              avatar_url: string | null
              bio: string | null
              boomplay_url: string | null
              created_at: string
              email: string | null
              full_name: string | null
              gender: string | null
              genre: string | null
              id: string
              is_approved: boolean | null
              is_featured: boolean | null
              phone_number: string | null
              spotify_url: string | null
              updated_at: string
              user_id: string | null
              youtube_music_url: string | null
            }
            SetofOptions: {
              from: "*"
              to: "profiles"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      generate_slug: { Args: { title_text: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      heartbeat: { Args: never; Returns: undefined }
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
