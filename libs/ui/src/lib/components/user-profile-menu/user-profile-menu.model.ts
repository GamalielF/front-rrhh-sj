import { DropdownItem, DropdownPlacement } from '../dropdown/dropdown.model';

export type UserProfileNameFormat = 'first-last' | 'full' | 'first-name';

export interface UserProfileData {
  id?: string | number;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  roles?: string[];
  avatarUrl?: string;
  [key: string]: unknown;
}

export type UserProfileMenuItem = DropdownItem;
export type UserProfilePlacement = DropdownPlacement;
