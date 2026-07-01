export type ExtraField = {
  key: string;
  label: string;
  required: boolean;
};

export type CertificateConfig = {
  x_pct: number;
  y_pct: number;
  font_size: number;
  font_color: string;
  font_family: string;
  align: "left" | "center" | "right";
};

export type Event = {
  id: string;
  name: string;
  event_date: string;
  qr_token: string;
  cover_image_url: string | null;
  extra_fields: ExtraField[];
  certificate_template_url: string | null;
  certificate_config: CertificateConfig | null;
  certificates_released: boolean;
  is_active: boolean;
  created_at: string;
};

export type Student = {
  id: string;
  event_id: string;
  full_name: string;
  nickname: string | null;
  instrument: string | null;
  teacher_name: string | null;
  search_name: string;
};

export type Registration = {
  id: string;
  student_id: string;
  event_id: string;
  extra_data: Record<string, string>;
  registered_at: string;
};

export type Database = {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "qr_token" | "created_at"> & {
          id?: string;
          qr_token?: string;
          created_at?: string;
        };
        Update: Partial<Event>;
        Relationships: [];
      };
      students: {
        Row: Student;
        Insert: Omit<Student, "id" | "search_name"> & { id?: string };
        Update: Partial<Omit<Student, "search_name">>;
        Relationships: [];
      };
      registrations: {
        Row: Registration;
        Insert: Omit<Registration, "id" | "registered_at"> & {
          id?: string;
          registered_at?: string;
        };
        Update: Partial<Registration>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
