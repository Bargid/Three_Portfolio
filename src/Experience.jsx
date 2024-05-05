import React, { useRef, useState } from 'react';
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial, Mesh } from 'three';
import * as THREE from 'three';
import WaterScene from './WaterScene';

export default function Experience() {

    // House scene Import and loading
    const { nodes } = useGLTF('./models/House_Scene.glb')
    const bakedObject = nodes.Baked;
    const chuteTop = nodes.Chute_top;

    // House scene texture
    const bakedTexture = useTexture('/models/Baked_02.jpg')
    bakedTexture.flipY = false

    return <>
        <OrbitControls makeDefault />

        {/* Background */}
        <color args={['#201919']} attach="background" />

        <mesh geometry={bakedObject.geometry} position={[0, -10, 0]}>
            <meshBasicMaterial map={bakedTexture} />
        </mesh>

         {/* Render the WaterScene component */}
         <WaterScene />
        
    </>
}
