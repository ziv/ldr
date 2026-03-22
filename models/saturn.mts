import {createRings, createSphere, wrapRings, wrapSphere} from "../ldraw/sphere.mjs";
import {getImageData} from "../ldraw/image.mjs";
import {render} from "../ldraw/render.mjs";
//
// const rings = [
//     ...createRings(65, 5),
//     ...createRings(75, 7),
//     ...createRings(82, 5),
// ];
//
// const ringsData = await getImageData("./assets/2k_saturn.jpg");
// render(wrapRings(rings, ringsData, 65, 87));
//
// const imageData = await getImageData("./assets/2k_saturn.jpg");
// render(wrapSphere(createSphere(50), imageData));
//


// const ringsData = await getImageData("./assets/2k_saturn_ring.png");


const imageData = await getImageData("./assets/2k_saturn.jpg");
render(wrapSphere(createSphere(30), imageData));

const rings = [
    ...createRings(40, 2),
    ...createRings(47, 5),
    ...createRings(52, 2),
];

// const ringsData = await getImageData("./assets/2k_saturn_ring.png");
const ringsData = await getImageData("./assets/2k_saturn.jpg");
render(wrapRings(rings, ringsData, 40, 54));
