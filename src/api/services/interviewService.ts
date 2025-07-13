import { InterviewInfo } from "@/types/entity";
import { supabase } from "../supabaseClient";

const createAndUpdateInterview = async (interview: Partial<InterviewInfo>) => {
  const { data, error } = await supabase
    .from("interviews")
    .upsert(interview);
  
  if (error) {
    console.error('Insert interview error:', error)
    throw error
  } else {
    console.log('Inserted interview row:', data)
  }
}

const getInterviewList = async ({profile, user, proposal}: {profile?: string, user?: string, proposal?: string}) => {
  let query = supabase
    .from('interviews')
    .select(`
      *,
      profile:profiles (
        id,
        email
      ),
      user:users (
        id,
        email
      )
    `);

  if (profile) {
    query = query.eq('profile', profile);
  }
  if (user) {
    query = query.eq('user', user);
  }
  if (proposal) {
    query = query.eq('proposal', proposal);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Get interview error:', error)
    throw error
  } else {
    console.log('Fetched interview data:', data);
    return data;
  }
}

const deleteInterview = async (interviewId: string) => {
  const { data, error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", interviewId)
  
  if (error) {
    console.error('Delete interview error:', error)
    throw error
  } else {
    console.log('deleted interview data:', data);
    return data;
  } 
}

export default {
  createAndUpdateInterview,
  getInterviewList,
  deleteInterview
}