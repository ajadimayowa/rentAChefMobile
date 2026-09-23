import { IUser } from "@/interfaces/user";

export const Naira = '₦';

// Mirrors the fields required by editUserProfile.tsx's four section schemas
// (personal, health, address, nok) — a profile only counts as "complete"
// once every section has been filled in.
export const isProfileComplete = (user?: IUser | null): boolean => {
  if (!user) return false;

  const hasPersonal = !!(user.fullName && user.gender && user.phoneNumber && user.dob && user.maritalStatus);
  const hasHealth = !!(
    user.customerDetails?.healthInformation?.healthDetails &&
    user.customerDetails?.healthInformation?.allergies?.length
  );
  const hasAddress = !!(user.address?.stateName && user.address?.city);
  const hasNok = !!(user.nok?.fullName && user.nok?.phone && user.nok?.relationship);

  return hasPersonal && hasHealth && hasAddress && hasNok;
};

export const convertToThousand = (value:any) => {
    value = value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
    return `${Naira}${value}`;
};

export const cutString = (str: string | undefined, length: number): string =>{
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

// Replaces the last 4 characters of a string with "*" — used to partially
// hide a chef's contact details (phone) shown to other users.
export const maskLast4 = (value: string | undefined | null): string => {
  if (!value) return "-";
  if (value.length <= 4) return "*".repeat(value.length);

  return value.slice(0, -4) + "****";
}

// Reveals only the first 5 characters of a string and masks the rest — used
// for a chef's email shown to other users (phone still uses maskLast4).
export const maskFirst5 = (value: string | undefined | null): string => {
  if (!value) return "-";
  if (value.length <= 5) return "*".repeat(value.length);

  return value.slice(0, 5) + "****";
}

// Fisher-Yates shuffle — returns a new shuffled array, leaving the original untouched.
export const shuffleArray = <T,>(arr: T[]): T[] => {
  const result = [...arr];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

// utils/formatListWithEllipsis.ts
export const formatListWithEllipsis = (
  arr: string[],
  maxItems: number = 3
): string => {
  if (!arr || arr.length === 0) return "";

  if (arr.length <= maxItems) {
    return arr.join(", ");
  }

  const sliced = arr.slice(0, maxItems);
  sliced[sliced.length - 1] = `${sliced[sliced.length - 1]}...`;

  return sliced.join(", ");
};