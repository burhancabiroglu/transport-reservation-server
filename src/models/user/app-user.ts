export interface AppUser {
  uid: string;
  name: string;
  surname: string;
  email: string;
  createdAt: string;
  isApproved: boolean;
  isBanned: boolean;
  emailVerified: boolean;
  isAdmin: boolean;
  fcmToken?: string;
  apnsToken?: string;
}
