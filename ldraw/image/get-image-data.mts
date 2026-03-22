import {Jimp} from "jimp";

export type ImageData = {
    width: number;
    height: number;
    data: Uint8Array;
};

/**
 * Load an image and return its data
 * @param path
 */
export async function getImageData(path: string): Promise<ImageData> {
    const image = await Jimp.read(path);
    return image.bitmap;
}