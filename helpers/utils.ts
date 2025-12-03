export const Naira = '₦';
export const convertToThousand = (value:any) => {
    value = value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
    return `${Naira}${value}`;
};

export const cutString = (str: string, length: number): string =>{
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}