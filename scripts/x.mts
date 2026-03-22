import {generateSphere} from "../ldraw/sphere/generate-sphere.mjs";
import {wrapSphere} from "../ldraw/sphere/wrap-sphere.mjs";
import {renderPart} from "../ldraw/ldraw/render-part.mjs";
import {getImageData} from "../ldraw/image/get-image-data.mjs";
import {packing} from "../ldraw/sphere/packing.mjs";

const imageData = await getImageData("./assets/2k_earth.jpg");
const sphere = generateSphere(3, 1);
const wrappedSphere = wrapSphere(sphere, imageData);

// const packed = packing(wrappedSphere);

// console.log(packed);
for (const v of wrappedSphere) {
    console.log(renderPart(v));
}