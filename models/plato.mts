import plato from './plato.json' with {type: 'json'};

for (const pos of plato) {
    console.log(`1 7 ${pos.x * 20} ${pos.y * - 24} ${pos.z * 20} 1 0 0 0 1 0 0 0 1 3005.dat`);
}