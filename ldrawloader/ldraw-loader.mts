import {Loader} from "three";

export class LdrawLoader extends Loader {

    materialLoaded = false;

    load(
        url: string,
        onLoad: (data: unknown) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (err: unknown) => void,
    ) {
        if (!this.materialLoaded) {
            // first, load materials
        }
    }

    loadMaterials() {

    }
}