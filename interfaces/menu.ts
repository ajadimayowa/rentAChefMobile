export interface IMenuItem {
    name: string;
    price: number;
    menuPic?: string;
    description?: string;
}


export interface IMenu {
    chef: {
        "name": string,
        "email": string,
        "id": string,
    },
    title: string;
    menuPic: string;
    items: IMenuItem[];
    basePrice:number;
    createdAt: Date;
}