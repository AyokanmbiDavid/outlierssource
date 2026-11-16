
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { supabase } from "../services/supabase";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);

  // Fetch authenticated user's profile
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      setError(error.message);
      throw error;
    }

    setProfile(data);
    setError(null);

    return data;
  }, [user]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    // Subscribe to changes belonging to this user
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        async () => {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .maybeSingle();

            if (!active) return;

            if (error) throw error;

            setProfile(data);
            setError(null);
          } catch (err) {
            if (active) {
              setError(err.message);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Profile realtime subscription failed.");
        }
      });

    // Initial profile fetch
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (active) {
          setProfile(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  // Update editable profile fields
  const updateProfile = async (updates) => {
    if (!user) {
      throw new Error("You must be logged in.");
    }

    const allowedFields = [
      "full_name",
      "phone",
      "bio",
    ];

    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) =>
        allowedFields.includes(key)
      )
    );

    if (Object.keys(safeUpdates).length === 0) {
      throw new Error("No valid profile changes supplied.");
    }

    setUpdating(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(safeUpdates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);

      return data;
    } finally {
      setUpdating(false);
    }
  };

  // Upload and update profile avatar
  const uploadAvatar = async (file) => {
    if (!user) {
      throw new Error("You must be logged in.");
    }

    if (!file) {
      throw new Error("Please select an image.");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be smaller than 5MB.");
    }

    setUploadingAvatar(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();

      const filePath = `${user.id}/avatar.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);

      return data;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Manually refresh profile
  const refreshProfile = async () => {
    return await fetchProfile();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        updating,
        uploadingAvatar,
        error,
        fetchProfile,
        updateProfile,
        uploadAvatar,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfile must be used inside ProfileProvider"
    );
  }

  return context;
}
