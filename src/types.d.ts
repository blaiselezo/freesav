declare class Tile {
    static create(data: any): Promise<any>;
}

declare class Note extends PlaceableObject {
	[key: string]: any;
}

declare interface Roll {
    options: any;
}