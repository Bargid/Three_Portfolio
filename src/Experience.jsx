import React, { useRef, useState } from 'react';
import { shaderMaterial, OrbitControls, useGLTF, useTexture, Plane } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GUI from 'lil-gui';
import waterFragmentShader from './shaders/water/fragment.glsl';
import waterVertexShader from './shaders/water/vertex.glsl';
import { Water } from 'three/examples/jsm/Addons.js';
import { log } from 'three/examples/jsm/nodes/Nodes.js';
// import WaterScene from './WaterScene.jsx';
// import WaterShader from '/WaterShader.jsx'


export default function Experience() {

    // Refs for Lights
    const windowRef = useRef();
    
    // House scene Import and loading
    const WaterMaterial = shaderMaterial( 
        {
            uTime: 0,
    
            uBigWavesElevation: 0.2,
            uBigWavesFrequency: new THREE.Vector2(4, 1.5),
            uBigWavesSpeed: 0.75,
    
            uSmallWavesElevation: 0.15,
            uSmallWavesFrequency: 3,
            uSmallWavesSpeed: 0.2,
            uSmallIterations: 4,
    
            uDepthColor: new THREE.Color('#186691'),
            uSurfaceColor: new THREE.Color('#9bd8ff'),
            uColorOffset: 0.08,
            uColorMultiplier: 5
        },
        waterVertexShader,
        waterFragmentShader
    );
    
    extend({ WaterMaterial })
    
    const { nodes } = useGLTF('./models/House_Scene.glb')
    console.log(nodes.Window_emission);
    const bakedObject = nodes.Baked;
    const chuteTop = nodes.Chute_top;

    // House scene texture
    const bakedTexture = useTexture('/models/Baked_02.jpg')
    bakedTexture.flipY = false

    // Emissve Lights
    

    // water geometry
    const waterGeometry = new THREE.PlaneGeometry(10, 3, 64, 1024)

    // waterMaterial
    const waterMaterial = useRef()
    useFrame((state, delta)=>
        {
            waterMaterial.current.uTime += delta
        }
    )

    // debug object for GUI
    const debugObject = {

        uBigWavesElevation: 0.2,
        uBigWavesFrequency: new THREE.Vector2(4, 1.5),
        uBigWavesSpeed: 0.75,

        uSmallWavesElevation: 0.15,
        uSmallWavesFrequency: 3,
        uSmallWavesSpeed: 0.2,
        uSmallIterations: 4,

        uDepthColor: new THREE.Color('#186691'),
        uSurfaceColor: new THREE.Color('#9bd8ff'),
        uColorOffset: 0.08,
        uColorMultiplier: 5,

        // Window Light
        uWindowPositionX: 0,
        uWindowPositionY: -1,
        uWindowPositionZ: 0,
        uWindowRotationX: 0,
        uWindowRotationY: 0,
        uWindowRotationZ: 0,

    };

      // Function to update material uniforms
    const updateMaterialUniforms = () => {
        waterMaterial.current.uniforms.uBigWavesElevation.value = debugObject.uBigWavesElevation;
        waterMaterial.current.uniforms.uBigWavesFrequency.value.x = debugObject.uBigWavesFrequency.x;
        waterMaterial.current.uniforms.uBigWavesFrequency.value.y = debugObject.uBigWavesFrequency.y;
        waterMaterial.current.uniforms.uBigWavesSpeed.value = debugObject.uBigWavesSpeed;
        waterMaterial.current.uniforms.uBigWavesElevation.value = debugObject.uBigWavesElevation;
        waterMaterial.current.uniforms.uSmallWavesFrequency.value = debugObject.uSmallWavesFrequency;
        waterMaterial.current.uniforms.uSmallWavesSpeed.value = debugObject.uSmallWavesSpeed;
        waterMaterial.current.uniforms.uSmallIterations.value = debugObject.uSmallIterations;

         // Update new uniform values
        waterMaterial.current.uniforms.uDepthColor.value.set(debugObject.uDepthColor);
        waterMaterial.current.uniforms.uSurfaceColor.value.set(debugObject.uSurfaceColor);
        waterMaterial.current.uniforms.uColorOffset.value = debugObject.uColorOffset;
        waterMaterial.current.uniforms.uColorMultiplier.value = debugObject.uColorMultiplier;
    };

    // GUI pannel
    const gui = new GUI({ width: 340 });

    // Add GUI controls for each parameter
    gui.add(debugObject, 'uBigWavesElevation').min(0).max(1).step(0.01).onChange(updateMaterialUniforms);
    gui.add(debugObject.uBigWavesFrequency, 'x').min(0).max(10).step(0.01).name('Big Waves Frequency X').onChange(updateMaterialUniforms);
    gui.add(debugObject.uBigWavesFrequency, 'y').min(0).max(10).step(0.01).name('Big Waves Frequency Y').onChange(updateMaterialUniforms);
    gui.add(debugObject, 'uBigWavesSpeed').min(0).max(4).step(0.01).name('Big Waves Speed').onChange(updateMaterialUniforms);
    gui.add(debugObject, 'uSmallWavesElevation').min(0).max(1).step(0.01).name('Small Waves Elevation').onChange(updateMaterialUniforms);
    gui.add(debugObject, 'uSmallWavesFrequency').min(0).max(30).step(0.01).name('Small Waves Frequency').onChange(updateMaterialUniforms);
    gui.add(debugObject, 'uSmallWavesSpeed').min(0).max(4).step(0.01).name('Small Waves Speed').onChange(updateMaterialUniforms);
    gui.add(debugObject, 'uSmallIterations').min(0).max(5).step(1).name('Small Iterations').onChange(updateMaterialUniforms);
    gui.addColor(debugObject, 'uDepthColor').name('Depth Color').onChange(updateMaterialUniforms);
    gui.addColor(debugObject, 'uSurfaceColor').name('Surface Color').onChange(updateMaterialUniforms);
    gui.add(debugObject, 'uColorOffset').min(0).max(1).step(0.01).name('Color Offset').onChange(updateMaterialUniforms);
    gui.add(debugObject, 'uColorMultiplier').min(0).max(10).step(0.01).name('Color Multiplier').onChange(updateMaterialUniforms);
    gui.add(debugObject, 'uWindowPositionX').min(-10).max(10).step(0.1).name('Window Pos X').onChange(() => {
        windowRef.current.position.x = debugObject.uWindowPositionX;
    });
    gui.add(debugObject, 'uWindowPositionY').min(-10).max(10).step(0.1).name('Window Pos Y').onChange(() => {
        windowRef.current.position.y = debugObject.uWindowPositionY;
    });
    gui.add(debugObject, 'uWindowPositionZ').min(-10).max(10).step(0.1).name('Window Pos Z').onChange(() => {
        windowRef.current.position.z = debugObject.uWindowPositionZ;
    });
    
    gui.add(debugObject, 'uWindowRotationX').min(0).max(Math.PI * 2).step(0.01).name('Window Rot X').onChange(() => {
        windowRef.current.rotation.x = debugObject.uWindowRotationX;
    });
    gui.add(debugObject, 'uWindowRotationY').min(0).max(Math.PI * 2).step(0.01).name('Window Rot Y').onChange(() => {
        windowRef.current.rotation.y = debugObject.uWindowRotationY;
    });
    gui.add(debugObject, 'uWindowRotationZ').min(0).max(Math.PI * 2).step(0.01).name('Window Rot Z').onChange(() => {
        windowRef.current.rotation.z = debugObject.uWindowRotationZ;
    });
    


    return <>
        <OrbitControls makeDefault />

        {/* Background */}
        <color args={['#201919']} attach="background" />

        <mesh geometry={bakedObject.geometry} position={[0, -10, 0]}>
            <meshBasicMaterial map={bakedTexture} />
        </mesh>

         {/* Render the WaterScene component */}
         <mesh
            geometry={ waterGeometry }
            position={[ 0, -1.58, 0.5 ]}
            rotation={[ -Math.PI / 2, 0, 0 ]}
         >
            <waterMaterial ref={ waterMaterial }/>
         </mesh>

         {/* Lights Objects */}
         <mesh geometry ={ nodes.Window_emission.geometry }
               ref={windowRef}>
            <meshBasicMaterial color="#ffffe5" />
         </mesh>
        
    </>
};