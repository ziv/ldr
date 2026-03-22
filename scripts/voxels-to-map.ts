import plato from '../assets/f15.json' with {type: 'json'};

const map: { [key: string]: boolean } = {};

// @ts-ignore
for (const pos of plato.voxels) {
    const [x, y, z] = pos;
    map[`${x}-${y}-${z}`] = true;
}
console.log(JSON.stringify(map));