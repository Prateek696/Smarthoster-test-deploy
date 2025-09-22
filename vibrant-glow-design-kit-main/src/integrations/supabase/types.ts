export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      authors: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          profile_image_url: string | null
          slug: string
          social_links: Json | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          profile_image_url?: string | null
          slug: string
          social_links?: Json | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          profile_image_url?: string | null
          slug?: string
          social_links?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          property_id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          property_id: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          property_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_source: string | null
          check_in_date: string
          check_out_date: string
          cleaning_fee: number | null
          created_at: string
          guest_email: string | null
          guest_name: string
          id: string
          property_id: string
          smarthoster_commission: number | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          booking_source?: string | null
          check_in_date: string
          check_out_date: string
          cleaning_fee?: number | null
          created_at?: string
          guest_email?: string | null
          guest_name: string
          id?: string
          property_id: string
          smarthoster_commission?: number | null
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          booking_source?: string | null
          check_in_date?: string
          check_out_date?: string
          cleaning_fee?: number | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          id?: string
          property_id?: string
          smarthoster_commission?: number | null
          status?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      content_generation_requests: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          generated_content_id: string | null
          id: string
          input_prompt: string
          language: string
          status: string
          target_location: string | null
          tone: string
          user_id: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generated_content_id?: string | null
          id?: string
          input_prompt: string
          language: string
          status?: string
          target_location?: string | null
          tone: string
          user_id: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generated_content_id?: string | null
          id?: string
          input_prompt?: string
          language?: string
          status?: string
          target_location?: string | null
          tone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_generation_requests_generated_content_id_fkey"
            columns: ["generated_content_id"]
            isOneToOne: false
            referencedRelation: "content_with_author"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_generation_requests_generated_content_id_fkey"
            columns: ["generated_content_id"]
            isOneToOne: false
            referencedRelation: "generated_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_links: {
        Row: {
          anchor_text: string
          created_at: string
          id: string
          link_type: string
          source_content_id: string | null
          target_url: string
        }
        Insert: {
          anchor_text: string
          created_at?: string
          id?: string
          link_type: string
          source_content_id?: string | null
          target_url: string
        }
        Update: {
          anchor_text?: string
          created_at?: string
          id?: string
          link_type?: string
          source_content_id?: string | null
          target_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_links_source_content_id_fkey"
            columns: ["source_content_id"]
            isOneToOne: false
            referencedRelation: "content_with_author"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_links_source_content_id_fkey"
            columns: ["source_content_id"]
            isOneToOne: false
            referencedRelation: "generated_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tag_relations: {
        Row: {
          content_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_tag_relations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_with_author"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_tag_relations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "generated_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          document_type: string
          file_size: number | null
          file_url: string | null
          id: string
          owner_id: string
          property_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          owner_id: string
          property_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          owner_id?: string
          property_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          ai_snippet: string | null
          author_id: string | null
          category: string
          content: string
          created_at: string
          date_modified: string | null
          date_published: string | null
          excerpt: string | null
          external_links: Json | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          internal_links: Json | null
          keywords: string[] | null
          language: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number | null
          schema_markup: Json | null
          slug: string
          status: string
          tags: string[] | null
          target_location: string | null
          title: string
          tone: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          ai_snippet?: string | null
          author_id?: string | null
          category: string
          content: string
          created_at?: string
          date_modified?: string | null
          date_published?: string | null
          excerpt?: string | null
          external_links?: Json | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          internal_links?: Json | null
          keywords?: string[] | null
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          schema_markup?: Json | null
          slug: string
          status?: string
          tags?: string[] | null
          target_location?: string | null
          title: string
          tone?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          ai_snippet?: string | null
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          date_modified?: string | null
          date_published?: string | null
          excerpt?: string | null
          external_links?: Json | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          internal_links?: Json | null
          keywords?: string[] | null
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          schema_markup?: Json | null
          slug?: string
          status?: string
          tags?: string[] | null
          target_location?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          commission_amount: number
          created_at: string
          due_date: string | null
          gross_amount: number
          id: string
          invoice_date: string
          invoice_number: string
          invoice_url: string | null
          net_amount: number
          property_id: string
          status: string | null
        }
        Insert: {
          commission_amount: number
          created_at?: string
          due_date?: string | null
          gross_amount: number
          id?: string
          invoice_date: string
          invoice_number: string
          invoice_url?: string | null
          net_amount: number
          property_id: string
          status?: string | null
        }
        Update: {
          commission_amount?: number
          created_at?: string
          due_date?: string | null
          gross_amount?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_url?: string | null
          net_amount?: number
          property_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          is_from_support: boolean | null
          message_text: string
          owner_id: string
          property_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_from_support?: boolean | null
          message_text: string
          owner_id: string
          property_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_from_support?: boolean | null
          message_text?: string
          owner_id?: string
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          property_type: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          property_type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          property_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      content_with_author: {
        Row: {
          ai_snippet: string | null
          author_bio: string | null
          author_id: string | null
          author_image: string | null
          author_name: string | null
          author_slug: string | null
          category: string | null
          content: string | null
          created_at: string | null
          date_modified: string | null
          date_published: string | null
          excerpt: string | null
          external_links: Json | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string | null
          internal_links: Json | null
          keywords: string[] | null
          language: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number | null
          schema_markup: Json | null
          slug: string | null
          status: string | null
          tags: string[] | null
          target_location: string | null
          title: string | null
          tone: string | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_reading_time: {
        Args: { content_text: string }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      migrate_all_blog_posts: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      migrate_blog_posts: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
