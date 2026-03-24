export const FINISH_TYPE_DEFAULT = 0;
export const FINISH_TYPE_CHROME = 1;
export const FINISH_TYPE_PEARLESCENT = 2;
export const FINISH_TYPE_RUBBER = 3;
export const FINISH_TYPE_MATTE_METALLIC = 4;
export const FINISH_TYPE_METAL = 5;


export type ColorDef = {
    fillColor: string;
    edgeColor: string;
    alpha: number;
    luminance: number;
    finishType: number;
    materialArgs: {
        roughness: number;
        metalness: number;
    };
}

export type ColorsMap = Record<string, ColorDef>;

export type BaseItemDef = {
    colorCode: string;
    vertices: number[][];
}

export type Face = BaseItemDef;
export type Line = BaseItemDef;
export type ConditionalLine = BaseItemDef & { controlPoints: number[][] };
export type SubObject = BaseItemDef & { fileName: string; inverted: boolean };

export type PartDef = {
    type: string;
    faces: Face[];
    lines: Line[];
    conditionalLines: ConditionalLine[];
    subObjects: SubObject[];
    totalFaces: number;
}