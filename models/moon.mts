import {createSphere, wrapSphere} from "../ldraw/sphere.mjs";
import {getImageData} from "../ldraw/image.mjs";
import {render} from "../ldraw/render.mjs";

const imageData = await getImageData("./assets/2k_moon.jpg");
render(wrapSphere(createSphere(10), imageData));