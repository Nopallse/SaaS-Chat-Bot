import { axiosInstance } from '@/services/axiosInstance';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/utils/constants';

const normalizeRole = (role: string): 'admin' | 'user' => {
	const r = role?.toLowerCase();
	return r === 'admin' ? 'admin' : 'user';
};

export const authApi = {
	login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
		const response = await axiosInstance.post(
			'/auth/login',
			credentials
		);
		// BE bisa kirim { access_token, user } atau { statusCode, message, data: { access_token, user } }
		const payload: any = response.data;
		const wrapped = payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
		const data = wrapped as { access_token: string; user: any };
		return {
			user: {
				id: data.user.id,
				name: data.user.name,
				email: data.user.email,
				role: normalizeRole(data.user.role),
				createdAt: new Date().toISOString(),
			},
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
		const wrapped = payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;

		if (wrapped?.access_token && wrapped?.user) {
			// Auto-login jika ada token
			return {
				user: {
					id: wrapped.user.id,
					name: wrapped.user.name,
					email: wrapped.user.email,
					role: normalizeRole(wrapped.user.role),
					createdAt: new Date().toISOString(),
				},
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
		// BE response: user payload langsung dari decorator
		const user = response.data as any;
		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: normalizeRole(user.role),
				createdAt: user.createdAt ?? new Date().toISOString(),
			},
			token: token ?? '',
		};
	},

	loginWithGoogle: () => {
		// Redirect ke BE endpoint untuk initiate Google OAuth
		window.location.href = `${API_URL}/auth/google`;
	},
};
