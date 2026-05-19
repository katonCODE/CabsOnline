export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookingStatus =
  | "unassigned"
  | "assigned"
  | "picked_up"
  | "completed"
  | "cancelled";

export type ProfileRole = "customer" | "admin" | "driver";

export type Database = {
  public: {
    Tables: {
      cabsonline_bookings: {
        Row: {
          assigned_at: string | null;
          assigned_driver_profile_id: string | null;
          booking_reference: string;
          created_at: string;
          customer_name: string;
          customer_profile_id: string | null;
          destination_latitude: number | null;
          destination_longitude: number | null;
          destination_suburb: string | null;
          id: string;
          phone: string;
          pickup_at: string;
          pickup_date: string;
          pickup_latitude: number | null;
          pickup_longitude: number | null;
          pickup_suburb: string | null;
          pickup_time: string;
          status: BookingStatus;
          street_name: string;
          street_number: string;
          unit_number: string | null;
          updated_at: string;
        };
        Insert: {
          assigned_at?: string | null;
          assigned_driver_profile_id?: string | null;
          booking_reference?: string;
          created_at?: string;
          customer_name: string;
          customer_profile_id?: string | null;
          destination_latitude?: number | null;
          destination_longitude?: number | null;
          destination_suburb?: string | null;
          id?: string;
          phone: string;
          pickup_at?: string;
          pickup_date: string;
          pickup_latitude?: number | null;
          pickup_longitude?: number | null;
          pickup_suburb?: string | null;
          pickup_time: string;
          status?: BookingStatus;
          street_name: string;
          street_number: string;
          unit_number?: string | null;
          updated_at?: string;
        };
        Update: {
          assigned_at?: string | null;
          assigned_driver_profile_id?: string | null;
          booking_reference?: string;
          created_at?: string;
          customer_name?: string;
          customer_profile_id?: string | null;
          destination_latitude?: number | null;
          destination_longitude?: number | null;
          destination_suburb?: string | null;
          id?: string;
          phone?: string;
          pickup_at?: string;
          pickup_date?: string;
          pickup_latitude?: number | null;
          pickup_longitude?: number | null;
          pickup_suburb?: string | null;
          pickup_time?: string;
          status?: BookingStatus;
          street_name?: string;
          street_number?: string;
          unit_number?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cabsonline_bookings_assigned_driver_profile_id_fkey";
            columns: ["assigned_driver_profile_id"];
            isOneToOne: false;
            referencedRelation: "cabsonline_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cabsonline_bookings_customer_profile_id_fkey";
            columns: ["customer_profile_id"];
            isOneToOne: false;
            referencedRelation: "cabsonline_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cabsonline_profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: ProfileRole;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: ProfileRole;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          role?: ProfileRole;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      cabsonline_create_public_booking: {
        Args: {
          p_customer_name: string;
          p_destination_latitude?: number | null;
          p_destination_longitude?: number | null;
          p_destination_suburb: string | null;
          p_phone: string;
          p_pickup_date: string;
          p_pickup_latitude?: number | null;
          p_pickup_longitude?: number | null;
          p_pickup_suburb: string | null;
          p_pickup_time: string;
          p_street_name: string;
          p_street_number: string;
          p_unit_number: string | null;
        };
        Returns: {
          booking_reference: string;
          pickup_date: string;
          pickup_time: string;
        }[];
      };
      cabsonline_generate_booking_reference: {
        Args: Record<string, never>;
        Returns: string;
      };
      cabsonline_is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Row"];

export type Inserts<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Insert"];

export type Updates<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Update"];

export type CabsonlineBooking = Tables<"cabsonline_bookings">;
export type CabsonlineBookingInsert = Inserts<"cabsonline_bookings">;
export type CabsonlineBookingUpdate = Updates<"cabsonline_bookings">;
export type CabsonlineProfile = Tables<"cabsonline_profiles">;
export type CabsonlineProfileInsert = Inserts<"cabsonline_profiles">;
export type CabsonlineProfileUpdate = Updates<"cabsonline_profiles">;
