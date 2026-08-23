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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contact_items: {
        Row: {
          created_at: string
          description: string | null
          href: string | null
          id: string
          is_active: boolean
          label: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          href?: string | null
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          href?: string | null
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      member_profiles: {
        Row: {
          created_at: string
          details: string
          github_url: string | null
          id: string
          image_url: string | null
          is_published: boolean
          name: string
          position: string
          skills: string[]
          slug: string
          sort_order: number
          summary: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          details: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          name: string
          position: string
          skills?: string[]
          slug: string
          sort_order?: number
          summary: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          details?: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          name?: string
          position?: string
          skills?: string[]
          slug?: string
          sort_order?: number
          summary?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      notices: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          pinned: boolean
          publication_status: Database["public"]["Enums"]["content_status"]
          published_at: string | null
          slug: string
          summary: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          pinned?: boolean
          publication_status?: Database["public"]["Enums"]["content_status"]
          published_at?: string | null
          slug: string
          summary: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          pinned?: boolean
          publication_status?: Database["public"]["Enums"]["content_status"]
          published_at?: string | null
          slug?: string
          summary?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      project_links: {
        Row: {
          created_at: string
          id: string
          label: string
          link_type: Database["public"]["Enums"]["project_link_type"]
          project_id: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          link_type: Database["public"]["Enums"]["project_link_type"]
          project_id: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          link_type?: Database["public"]["Enums"]["project_link_type"]
          project_id?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          role: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          featured: boolean
          id: string
          publication_status: Database["public"]["Enums"]["content_status"]
          published_at: string | null
          released_at: string | null
          slug: string
          sort_order: number
          started_at: string | null
          status: Database["public"]["Enums"]["project_status"]
          summary: string
          tags: string[]
          thumbnail_path: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          featured?: boolean
          id?: string
          publication_status?: Database["public"]["Enums"]["content_status"]
          published_at?: string | null
          released_at?: string | null
          slug: string
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary: string
          tags?: string[]
          thumbnail_path?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          featured?: boolean
          id?: string
          publication_status?: Database["public"]["Enums"]["content_status"]
          published_at?: string | null
          released_at?: string | null
          slug?: string
          sort_order?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string
          tags?: string[]
          thumbnail_path?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      recruitment_steps: {
        Row: {
          created_at: string
          description: string
          id: string
          recruitment_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          recruitment_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          recruitment_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_steps_recruitment_id_fkey"
            columns: ["recruitment_id"]
            isOneToOne: false
            referencedRelation: "recruitments"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitments: {
        Row: {
          activities: string[]
          application_label: string
          application_url: string | null
          contact_href: string | null
          contact_label: string | null
          contact_value: string | null
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          is_current: boolean
          publication_status: Database["public"]["Enums"]["content_status"]
          published_at: string | null
          qualifications: string[]
          starts_at: string | null
          status: Database["public"]["Enums"]["recruitment_status"]
          summary: string
          target: string[]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activities?: string[]
          application_label?: string
          application_url?: string | null
          contact_href?: string | null
          contact_label?: string | null
          contact_value?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_current?: boolean
          publication_status?: Database["public"]["Enums"]["content_status"]
          published_at?: string | null
          qualifications?: string[]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["recruitment_status"]
          summary: string
          target?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activities?: string[]
          application_label?: string
          application_url?: string | null
          contact_href?: string | null
          contact_label?: string | null
          contact_value?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_current?: boolean
          publication_status?: Database["public"]["Enums"]["content_status"]
          published_at?: string | null
          qualifications?: string[]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["recruitment_status"]
          summary?: string
          target?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string
          hero_image_path: string | null
          id: number
          logo_path: string | null
          name: string
          short_description: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description: string
          hero_image_path?: string | null
          id?: number
          logo_path?: string | null
          name: string
          short_description: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          hero_image_path?: string | null
          id?: number
          logo_path?: string | null
          name?: string
          short_description?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          label: string
          platform: string
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label: string
          platform: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          platform?: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_content: { Args: never; Returns: boolean }
      create_recruitment: {
        Args: {
          p_activities: string[]
          p_application_label: string
          p_application_url: string
          p_contact_href: string
          p_contact_label: string
          p_contact_value: string
          p_ends_at: string
          p_publication_status: Database["public"]["Enums"]["content_status"]
          p_qualifications: string[]
          p_starts_at: string
          p_status: Database["public"]["Enums"]["recruitment_status"]
          p_steps: Json
          p_summary: string
          p_target: string[]
          p_title: string
        }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      save_recruitment: {
        Args: {
          p_activities: string[]
          p_application_label: string
          p_application_url: string
          p_contact_href: string
          p_contact_label: string
          p_contact_value: string
          p_ends_at: string
          p_id: string
          p_publication_status: Database["public"]["Enums"]["content_status"]
          p_qualifications: string[]
          p_starts_at: string
          p_status: Database["public"]["Enums"]["recruitment_status"]
          p_steps: Json
          p_summary: string
          p_target: string[]
          p_title: string
        }
        Returns: string
      }
      set_current_recruitment: { Args: { p_id: string }; Returns: undefined }
      unset_current_recruitment: { Args: { p_id: string }; Returns: undefined }
    }
    Enums: {
      content_status: "draft" | "published" | "archived"
      project_link_type:
        | "github"
        | "website"
        | "download"
        | "youtube"
        | "steam"
        | "itchio"
      project_status: "planning" | "developing" | "released" | "archived"
      recruitment_status: "upcoming" | "open" | "closed" | "always"
      user_role: "member" | "editor" | "admin"
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
      content_status: ["draft", "published", "archived"],
      project_link_type: [
        "github",
        "website",
        "download",
        "youtube",
        "steam",
        "itchio",
      ],
      project_status: ["planning", "developing", "released", "archived"],
      recruitment_status: ["upcoming", "open", "closed", "always"],
      user_role: ["member", "editor", "admin"],
    },
  },
} as const
