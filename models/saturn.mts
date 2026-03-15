import {createRings, createSphere, wrapRings, wrapSphere} from "../ldraw/sphere.mjs";
import {getImageData} from "../ldraw/image.mjs";
import {render} from "../ldraw/render.mjs";

const imageData = await getImageData("./assets/2k_saturn.jpg");
render(wrapSphere(createSphere(30), imageData));

const rings = [
    ...createRings(40, 2),
    ...createRings(46, 4),
    ...createRings(52, 2),
];

const ringsData = await getImageData("./assets/2k_saturn_ring.png");
render(wrapRings(rings, ringsData, 40, 54));
