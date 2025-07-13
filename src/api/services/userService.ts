import { supabase, supabaseAdmin } from "../supabaseClient";

import type { UserInfo, UserToken } from "#/entity";
import type { AuthError, AuthResponse, Session } from "@supabase/supabase-js";
import { GLOBAL_CONFIG } from "@/global-config";

export interface AuthReq {
	email: string;
	password: string;
}

export interface SignInReq {
	username: string;
	password: string;
}

export interface SignUpReq extends SignInReq {
	email: string;
}
export type SignInRes = UserToken & { user: UserInfo };

export enum UserApi {
	SignIn = "/auth/signin",
	SignUp = "/auth/signup",
	Logout = "/auth/logout",
	Refresh = "/auth/refresh",
	User = "/user",
}

// const signin = (data: SignInReq) => apiClient.post<SignInRes>({ url: UserApi.SignIn, data });
// const signup = (data: SignUpReq) => apiClient.post<SignInRes>({ url: UserApi.SignUp, data });
// const logout = () => apiClient.get({ url: UserApi.Logout });
// const findById = (id: string) => apiClient.get<UserInfo[]>({ url: `${UserApi.User}/${id}` });

const signup = async (credentials: AuthReq): Promise<{data: AuthResponse['data']; error: AuthError | null}> => {
	console.log("credentials", credentials)
	const { data, error } = await supabase.auth.signUp({
		email: credentials.email,
		password: credentials.password
	});
	if (error) {
    console.error('Signup error:', error.message);
		throw error;
  } else {
    console.log('Signup success:', data);
  }
	return { data, error }
}

const signin = async (credentials: AuthReq): Promise<{user: UserInfo, session: Session}> => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    console.error('Signin error:', error.message);
		throw error;
  } else {
    console.log('Signin success:', data);
  }
	if (!data || !data.user || !data.session) {
    throw new Error("Invalid sign-in response");
  }

	const { data: userProfile, error: profileError } = await supabase
		.from("users")
		.select("*")
		.eq("id", data.user.id)
		.single();

	if (profileError || !userProfile) {
    throw new Error("Failed to load user profile");
  }

	return { user: userProfile as UserInfo, session: data.session };
};

const getCurrentUser = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Get user error:', error.message);
  } else {
    console.log('Current user:', user);
  }
};

const getUserList = async () : Promise<Partial<UserInfo>[]> => {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("role", 1)

	if (error) {
    console.error('Error fetching users:', error.message);
		throw error
  } else {
    return data as Partial<UserInfo>[];
  }
}

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Signout error:', error.message);
  } else {
    console.log('User signed out');
  }
};

const forgotPassword = async (email: string) => {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: GLOBAL_CONFIG.resetPasswordUrl
	});

	if (error) {
    console.error('Error sending reset link:', error.message);
		throw error
  } else {
    return 'Check your email for a secure login link.';
  }
}

const updatePassword = async (newPassword: string) => {
	const { error } = await supabase.auth.updateUser({
		password: newPassword,
	});

	if (error) {
    console.error('Error reset password:', error.message);
		throw error
  } else {
    return 'Password updated successfully. You can now log in.';
  }
}

const updateProfile = async (profile: Partial<UserInfo>, userId: string) => {
	const { data, error } = await supabase
		.from("users")
		.update(profile)
		.eq("id", userId)
		.select("*")
		.single();

	if (error) {
    console.error('Error update user profile:', error.message);
		throw error
  } else {
    return data;
  }
}

const deleteUser = async (userId: string) => {
	const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

	if (error) {
    console.error('Error delete user:', error.message);
		throw error
  } else {
  	console.log("User deleted successfully");
		return data;
  }
}

export default {
	signin,
	signup,
	getCurrentUser,
	logout,
	forgotPassword,
	updatePassword,
	updateProfile,
	getUserList,
	deleteUser
};
