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