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

	register: async (data: RegisterData): Promise<AuthResponse> => {
		const response = await axiosInstance.post('/auth/register', {
			name: data.name,
			email: data.email,
			password: data.password,
		});

		// Dukungan 3 pola respons:
		// 1) { access_token, user }
		// 2) { statusCode, message, data: { access_token, user } }
		// 3) { statusCode, message, data: { ...userFields } } -> fallback login
		const payload: any = response.data;
		const wrapped = payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;

		if (wrapped?.access_token && wrapped?.user) {
			return {
				user: {
					id: wrapped.user.id,
					name: wrapped.user.name,
					email: wrapped.user.email,
					role: normalizeRole(wrapped.user.role),
					createdAt: new Date().toISOString(),
				},
				token: wrapped.access_token,
			};
		}

		// Jika BE hanya mengembalikan user tanpa token, lakukan login manual
		return await authApi.login({ email: data.email, password: data.password });
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
