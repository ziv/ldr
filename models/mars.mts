import {createSphere, wrapSphere} from "../ldraw/sphere.mjs";
import {getImageData} from "../ldraw/image.mjs";
import {render} from "../ldraw/render.mjs";

const imageData = await getImageData("./assets/2k_jupiter.jpg");
const sphere = createSphere(70).filter(x => x.pos.z < 0);
render(wrapSphere(sphere, imageData));