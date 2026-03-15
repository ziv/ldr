import {createSphere, wrapSphere} from "../ldraw/sphere.mjs";
import {getImageData} from "../ldraw/image.mjs";
import {render} from "../ldraw/render.mjs";

const imageData = await getImageData("./assets/2k_mercury.jpg");
const sun = wrapSphere(createSphere(20), imageData);

render(sun);