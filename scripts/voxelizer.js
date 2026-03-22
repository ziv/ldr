import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';

THREE.Mesh.prototype.raycast = acceleratedRaycast;

/**
 * Voxelize a GLB model using scanline raycasting.
 * @param {ArrayBuffer} glbData - GLB file contents
 * @param {number} voxelSize - Size of each voxel in model units
 * @param {(progress: number) => void} [onProgress] - Progress callback (0-1)
 * @returns {Promise<{ voxels: [number,number,number][], size: [number,number,number], origin: {x:number,y:number,z:number}, voxelSize: number }>}
 */
export async function voxelize(glbData, voxelSize, onProgress) {
  const loader = new GLTFLoader();
  const gltf = await new Promise((resolve, reject) => {
    loader.parse(glbData, '', resolve, reject);
  });

  // Collect mesh geometries with world transforms applied
  const geometries = [];
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((node) => {
    if (!node.isMesh) return;

    const src = node.geometry;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', src.getAttribute('position').clone());

    if (src.index) {
      geom.setIndex(src.index.clone());
    } else {
      const count = src.getAttribute('position').count;
      const idx = new Uint32Array(count);
      for (let i = 0; i < count; i++) idx[i] = i;
      geom.setIndex(new THREE.BufferAttribute(idx, 1));
    }

    geom.applyMatrix4(node.matrixWorld);
    geometries.push(geom);
  });

  if (geometries.length === 0) {
    throw new Error('No meshes found in GLB file');
  }

  const merged = geometries.length === 1
    ? geometries[0]
    : mergeGeometries(geometries);
  if (!merged) throw new Error('Failed to merge geometries');

  // Build BVH for accelerated raycasting
  const bvh = new MeshBVH(merged);
  merged.boundsTree = bvh;

  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(merged, material);

  // Bounding box with padding
  merged.computeBoundingBox();
  const bbox = merged.boundingBox.clone();
  bbox.min.subScalar(voxelSize);
  bbox.max.addScalar(voxelSize);

  const sizeX = Math.ceil((bbox.max.x - bbox.min.x) / voxelSize);
  const sizeY = Math.ceil((bbox.max.y - bbox.min.y) / voxelSize);
  const sizeZ = Math.ceil((bbox.max.z - bbox.min.z) / voxelSize);

  // List of [x, y, z] tuples for voxels inside the model
  const voxels = [];

  // Scanline raycasting along +X for each (Y, Z) line.
  // A point is inside the mesh when the ray from outside
  // has crossed an odd number of surface intersections.
  const raycaster = new THREE.Raycaster();
  raycaster.firstHitOnly = false;
  const direction = new THREE.Vector3(1, 0, 0);
  const origin = new THREE.Vector3();
  const eps = voxelSize * 0.0001;

  for (let y = 0; y < sizeY; y++) {
    for (let z = 0; z < sizeZ; z++) {
      origin.set(
        bbox.min.x - voxelSize,
        bbox.min.y + (y + 0.5) * voxelSize,
        bbox.min.z + (z + 0.5) * voxelSize,
      );

      raycaster.set(origin, direction);
      const hits = raycaster.intersectObject(mesh);
      if (hits.length === 0) continue;

      hits.sort((a, b) => a.distance - b.distance);

      // Deduplicate nearly-coincident hits (shared edges/vertices)
      const unique = [hits[0]];
      for (let i = 1; i < hits.length; i++) {
        if (hits[i].distance - hits[i - 1].distance > eps) {
          unique.push(hits[i]);
        }
      }

      let hitIdx = 0;
      let inside = false;

      for (let x = 0; x < sizeX; x++) {
        const voxelDist = bbox.min.x + (x + 0.5) * voxelSize - origin.x;
        while (hitIdx < unique.length && unique[hitIdx].distance < voxelDist) {
          inside = !inside;
          hitIdx++;
        }
        if (inside) {
          voxels.push([x, y, z]);
        }
      }
    }

    // Yield to browser & report progress after each Y-slice
    if (onProgress) {
      onProgress((y + 1) / sizeY);
    }
    await new Promise((r) => setTimeout(r, 0));
  }

  return {
    voxels,
    size: [sizeX, sizeY, sizeZ],
    origin: { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
    voxelSize,
  };
}