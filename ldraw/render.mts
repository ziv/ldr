import {type LdrawPart, Vec3} from "./primitives.mjs";

export function render(parts: LdrawPart[], pos = Vec3()) {
    for (const part of parts) {
        part.pos.add(pos);
        console.log(part.toString());
    }
}