import plato from '../assets/f15.json' with {type: 'json'};
import map from '../assets/f15map.json' with {type: 'json'};

function getMap() {
    return map as { [key: string]: boolean };
}


function isVoxelNearEdge(x: number, y: number, z: number) {
    // if one of the surrounding voxels is not exists, this is an edge
    let surrounding = 26;
    const m = getMap();

    for (let i = x - 1; i <= x + 1; ++i) {
        for (let j = y - 1; j <= y + 1; ++j) {
            for (let k = z - 1; k <= z + 1; ++k) {
                if (x === i && y === j && z === k) {
                    continue; // we are checking the current voxel, skip it
                }
                if (m[`${i}-${j}-${k}`] !== undefined) {
                    surrounding--;
                }

            }
        }
    }

    // if we didn't remove them all, they are edges
    console.error(surrounding);
    return surrounding > 0;
}


// @ts-ignore
for (const pos of plato.voxels) {
    const [x, y, z] = pos as [number, number, number];
    // const exists = map[`${x}-${y}-${z}`] as boolean;
    // if (getMap()[`${x}-${y}-${z}`]) {
    //     console.log(`1 7 ${x * 20} ${y * -24} ${z * 20} 1 0 0 0 1 0 0 0 1 3005.dat`);
    // }
    if (!isVoxelNearEdge(x, y, z)) {
        continue; // skip edge voxels
    }
    console.log(`1 7 ${x * 20} ${y * -24} ${z * 20} 1 0 0 0 1 0 0 0 1 3005.dat`);
    // const ratio = 1 - (pos.x + 17) / 40;
    // const c = Math.floor(ratio * 256).toString(16).padStart(2, "0");
    // const color = `0x2${c}${c}${c}`;

}