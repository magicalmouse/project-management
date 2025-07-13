import { ProfileInfo } from "@/types/entity";
import { supabase } from "../supabaseClient";

const createAndUpdateProfile = async (profile: Partial<ProfileInfo>) => {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile);
  
  if (error) {
    console.error('Insert profile error:', error)
    throw error
  } else {
    console.log('Inserted profile row:', data)
  }
}

const getProfileList = async (userId?: string) => {
  let query = supabase
    .from("profiles")
    .select(`
      *,
      user:users (
        id,
        email
      )
    `);

  if (userId) {
    query = query.eq('user', userId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Get profile error:', error)
    throw error
  } else {
    console.log('Fetched profile data:', data);
    return data;
  }
}

const deleteProfile = async (profileId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId)
  
  if (error) {
    console.error('Delete profile error:', error)
    throw error
  } else {
    console.log('deleted profile data:', data);
    return data;
  } 
}

export default {
  createAndUpdateProfile,
  getProfileList,
  deleteProfile
}