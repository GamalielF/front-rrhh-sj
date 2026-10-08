import { UserProfileData, UserProfileNameFormat } from './user-profile-menu.model';

export function extractFirstAndLastName(fullName: string): string {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return 'Usuario';
  const parts = trimmed.split(/\s+/);

  if (parts.length <= 1) {
    return parts[0];
  }
  if (parts.length === 2 || parts.length === 3) {
    return `${parts[0]} ${parts[1]}`;
  }
  return `${parts[0]} ${parts[2]}`;
}

export function formatUserProfileName(
  user: UserProfileData | null,
  format: UserProfileNameFormat = 'first-last'
): string {
  if (!user) return 'Usuario';

  const rawFullName = (user.name || user.username || 'Usuario').trim();

  if (format === 'full') {
    return rawFullName;
  }

  const parts = rawFullName.split(/\s+/);
  if (parts.length <= 1) {
    return rawFullName;
  }

  if (format === 'first-name') {
    return parts[0];
  }

  return extractFirstAndLastName(rawFullName);
}
