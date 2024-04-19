import React, { useRef } from 'react';
import { OrbitControls, useGLTF, Environment, useTexture } from '@react-three/drei'
import * as THREE from 'three';
import { TextureLoader } from 'three';

export default function Experience()
{

    // House scene Import and loading
    const { nodes } = useGLTF('./models/House_Scene.glb')
    console.log(nodes.Baked);
    const bakedObject = nodes.Baked;
    console.log(bakedObject);

    // House scene texture
    const bakedTexture = useTexture('/models/Baked.jpg')
    bakedTexture.flipY = false
    console.log(bakedTexture);

    return <>

        <OrbitControls makeDefault />
        {/* <Environment preset="city" /> */}

        {/* Background */}
        <color args = { [ '#201919' ] } attach = "background" />

        <mesh geometry = { bakedObject.geometry } position = { [ 0, -10, 0 ] }>
            <meshBasicMaterial map = { bakedTexture } />
        </mesh>
        
    </>
}