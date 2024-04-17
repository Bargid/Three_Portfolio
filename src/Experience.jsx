import React, { useRef } from 'react';
import { OrbitControls, useGLTF, Environment, useTexture } from '@react-three/drei'
import * as THREE from 'three';
import { TextureLoader } from 'three';

export default function Experience()
{

    // House scene Import and loading
    const HouseModel = useGLTF('./models/House_Scene.glb')
    console.log(HouseModel.nodes);

    // House scene texture
    const bakedTexture = useTexture('/models/Baked.jpg')
    bakedTexture.flipY = false
    console.log(bakedTexture);

    return <>

        <OrbitControls makeDefault />
        <Environment preset="city" />

        {/* Background */}
        <color args = { [ '#201919' ] } attach = "background" />

        <mesh geometry = { HouseModel.nodes.Baked.geometry } position = { [ 0, -10, 0 ] }>
            <meshBasicMaterial map = { bakedTexture } />
        </mesh>
    </>
}