import { AppUser } from "@models/user/app-user";

export interface LoginResponse {
  readonly user: AppUser
  readonly accessToken: string;
}
