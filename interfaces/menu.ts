export interface IMenuItem {
    name: string;
    price: number;
    menuPic?: string;
    description?: string;
}


export interface IMenu {
    id:string,
    chef: {
        "name": string,
        "email": string,
        "id": string,
    },
    title: string;
    image:string;
    menuPic: string;
    items: IMenuItem[];
    basePrice:number;
    createdAt: Date;
    description:string;
}

export interface ISpecialMenu {
  id: string;
  title: string;
  description: string;
  minimumGuests: number;
  numberOfDishes: number;
  image: string;
  price: number;
  procurements: any[]; // you can replace `any` with a proper type if you know the structure
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date if you parse it
}