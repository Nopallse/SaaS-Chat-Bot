import { axiosInstance } from '@/services/axiosInstance';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/utils/constants';

const normalizeRole = (role: string): 'admin' | 'user' => {
	const r = role?.toLowerCase();
	return r === 'admin' ? 'admin' : 'user';
};

const unwrapPayload = (payload: any) =>
	payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;

const normalizeUser = (rawUser: any) => {
	const user = unwrapPayload(rawUser) ?? {};
	return {
		id: user.id ?? user.userId ?? user.sub ?? '',
		name: user.name ?? user.fullName ?? 'User',
		email: user.email ?? '',
		role: normalizeRole(user.role),
		createdAt: user.createdAt ?? new Date().toISOString(),
	};
};

export const authApi = {
	login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
		const response = await axiosInstance.post(
			'/auth/login',
			credentials
		);
		// BE bisa kirim { access_token, user } atau { statusCode, message, data: { access_token, user } }
		const payload: any = response.data;
		const wrapped = unwrapPayload(payload);
		const data = wrapped as { access_token: string; user: any };
		return {
			user: normalizeUser(data.user),
			token: data.access_token,
		};
	},

	register: async (data: RegisterData): Promise<{ user: any; message: string; requiresVerification: boolean }> => {
		const response = await axiosInstance.post('/auth/register', {
			name: data.name,
			email: data.email,
			password: data.password,
		});

		// Dukungan pola respons:
		// { statusCode, message, data: { success, message, user } }
		const payload: any = response.data;
		const wrapped = unwrapPayload(payload);

		if (wrapped?.access_token && wrapped?.user) {
			// Auto-login jika ada token
			return {
				user: normalizeUser(wrapped.user),
				message: wrapped.message || 'Registered successfully',
				requiresVerification: false,
			};
		}

		// Jika hanya user info tanpa token, berarti perlu verifikasi
		if (wrapped?.user) {
			return {
				user: wrapped.user,
				message: wrapped.message || 'Please verify your email to activate your account',
				requiresVerification: true,
			};
		}

		throw new Error('Invalid registration response');
	},

	logout: async (): Promise<void> => {
		await axiosInstance.post('/auth/logout');
	},

	getCurrentUser: async (): Promise<AuthResponse> => {
		const token = useAuthStore.getState().token;
		const response = await axiosInstance.get('/auth/me');
		const payload: any = response.data;
		const user = unwrapPayload(payload);
		return {
			user: normalizeUser(user),
			token: token ?? '',
		};
	},

	loginWithGoogle: () => {
		// Redirect ke BE endpoint untuk initiate Google OAuth
		window.location.href = `${API_URL}/auth/google`;
	},
};
