export class Coordinates {
    constructor(
        public readonly lon: number,
        public readonly lat: number,
    ) {}
}

export class CourseNode {
    constructor(
       public readonly location: Coordinates,
       public readonly progress: number,
       public readonly bearing: number,
    ) {}
}

export class InspectLocationResult {
    public readonly warning: string | null;
    public readonly turning: string[];
}