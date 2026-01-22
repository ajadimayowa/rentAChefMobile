export const Naira = '₦';
export const convertToThousand = (value:any) => {
    value = value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
    return `${Naira}${value}`;
};

export const cutString = (str: string, length: number): string =>{
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

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