import {Jimp} from "jimp";
import type {ImageData} from "./primitives.mjs";

/**
 * Load an image and return its data
 * @param path
 */
export async function getImageData(path: string): Promise<ImageData> {
    const image = await Jimp.read(path);
    return image.bitmap;
}