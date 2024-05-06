// // import { useRef } from 'react';
// // import { useFrame } from '@react-three/fiber';
// // import { ShaderMaterial } from 'three';
// // import * as THREE from 'three'
// // import GUI from 'lil-gui'
// // import waterVertexShader from './shaders/water/vertex.glsl';
// // import waterFragmentShader from './shaders/water/fragment.glsl';

// // const WaterShader = () => {
// //   const materialRef = useRef();

// //   useFrame((state, delta) => {
// //     const elapsedTime = state.clock.getElapsedTime();
// //     materialRef.current.uniforms.uTime.value = elapsedTime;
// //   });

// //   return (
// //     <shaderMaterial
// //       ref={materialRef}
// //       vertexShader={ waterVertexShader }
// //       fragmentShader={ waterFragmentShader }
// //       uniforms={{
// //         uTime: { value: 0 },
// //         uBigWavesElevation: { value: 0.2 },
// //         uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
// //         uBigWavesSpeed: { value: 0.75 },
// //         uSmallWavesElevation: { value: 0.15 },
// //         uSmallWavesFrequency: { value: 3 },
// //         uSmallWavesSpeed: { value: 0.2 },
// //         uSmallIterations: { value: 4 },
// //         uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
// //         uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
// //         uColorOffset: { value: 0.08 },
// //         uColorMultiplier: { value: 5 },
// //       }}
// //     />
// //   );
// // };

// // export default WaterShader;

// import React, { useRef, useEffect } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { ShaderMaterial } from 'three';
// import * as THREE from 'three';
// import GUI from 'lil-gui';
// import waterVertexShader from './shaders/water/vertex.glsl';
// import waterFragmentShader from './shaders/water/fragment.glsl';

// const WaterShader = () => {
//   const materialRef = useRef();

//   useEffect(() => {
//     // Canvas
//     const canvas = document.querySelector('canvas.webgl');

//     // Scene
//     const scene = new THREE.Scene();

//     // Debug
//     const gui = new GUI({ width: 340 });
//     const debugObject = {};

//     // Geometry 
//     const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);

//     // Colors
//     debugObject.depthColor = '#186691';
//     debugObject.surfaceColor = '#9bd8ff';

//     gui.addColor(debugObject, 'depthColor').onChange(() => { materialRef.current.uniforms.uDepthColor.value.set(debugObject.depthColor); });
//     gui.addColor(debugObject, 'surfaceColor').onChange(() => { materialRef.current.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor); });

//     // Material
//     const waterMaterial = new THREE.ShaderMaterial({
//       vertexShader: waterVertexShader,
//       fragmentShader: waterFragmentShader,
//       uniforms: {
//         uTime: { value: 0 },
//         uBigWavesElevation: { value: 0.2 },
//         // Add other uniforms here
//       },
//     });

//     // Add material to materialRef
//     materialRef.current = waterMaterial;

//     gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation');
//     // Add other GUI controls here

//     // Mesh
//     const water = new THREE.Mesh(waterGeometry, waterMaterial);
//     water.rotation.x = -Math.PI * 0.5;
//     scene.add(water);

//     // Renderer
//     const renderer = new THREE.WebGLRenderer({
//       canvas: canvas,
//     });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//     // Sizes
//     const sizes = {
//       width: window.innerWidth,
//       height: window.innerHeight,
//     };

//     window.addEventListener('resize', () => {
//       // Update sizes
//       sizes.width = window.innerWidth;
//       sizes.height = window.innerHeight;

//       // Update camera
//       // Update renderer
//       renderer.setSize(sizes.width, sizes.height);
//       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     });

//     // Animate
//     const clock = new THREE.Clock();

//     const tick = () => {
//       const elapsedTime = clock.getElapsedTime();

//       // Water
//       waterMaterial.uniforms.uTime.value = elapsedTime;

//       // Render
//       renderer.render(scene, camera);

//       // Call tick again on the next frame
//       window.requestAnimationFrame(tick);
//     };

//     tick();

//     // Cleanup function
//     return () => {
//       // Clean up event listeners or any resources if needed
//       window.removeEventListener('resize');
//     };
//   }, []); // Empty dependency array ensures this effect runs only once after initial mount

//   useFrame((state, delta) => {
//     const elapsedTime = state.clock.getElapsedTime();
//     materialRef.current.uniforms.uTime.value = elapsedTime;
//   });

//   return null; // Return null because nothing is rendered directly by this component
// };

// export default WaterShader;