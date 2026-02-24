import type { SafeUser, User } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			user?: SafeUser;
		}
		interface PageData {
			user?: SafeUser | null;
		}
	}
}

export {};
