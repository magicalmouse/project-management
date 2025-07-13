import { ProposalInfo } from "@/types/entity";
import { supabase } from "../supabaseClient";

const createAndUpdateProposal = async (proposal: Partial<ProposalInfo>) => {
  const { data, error } = await supabase
    .from("proposals")
    .upsert(proposal);
  
  if (error) {
    console.error('Insert proposal error:', error)
    throw error
  } else {
    console.log('Inserted proposal row:', data)
  }
}

const getProposalList = async ({ userId, profileId }: {userId: string, profileId?: string}) => {
  let query = supabase
    .from("proposals")
    .select("*")
    .eq("user", userId)

  if (profileId) {
    query = query.eq("profile", profileId);
  }
  const { data, error } = await query;
  
  if (error) {
    console.error('Get proposal error:', error)
    throw error
  } else {
    console.log('Fetched proposal data:', data);
    return data;
  }
}

const deleteProposal = async ({ proposalId, proposalIds }: {proposalId?: string, proposalIds?: string[]}) => {
  console.log(proposalId, proposalIds)
  let query = supabase
    .from("proposals")
    .delete()

  if (proposalId) {
    query = query.eq("id", proposalId)
  }
  if (proposalIds?.length) {
    query = query.in("id", proposalIds!);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Delete proposal error:', error)
    throw error
  } else {
    console.log('deleted proposal data:', data);
    return data;
  } 
}

export default {
  createAndUpdateProposal,
  getProposalList,
  deleteProposal
}