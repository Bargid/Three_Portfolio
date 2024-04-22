import React, { useRef } from 'react';
import { OrbitControls, useGLTF, Environment, useTexture } from '@react-three/drei'
import * as THREE from 'three';
import { TextureLoader } from 'three';

export default function Experience()
{

    // House scene Import and loading
    const { nodes: nodes1 } = useGLTF('./models/House_Scene.glb')
    const bakedObject = nodes1.Baked;

    // Emissions and Chute Import and loading
    const { nodes: nodes2 } = useGLTF('./models/House_Emissions.glb')
    // console.log(nodes2);
    const chuteTop = nodes2.Chute_top;



    // House scene texture
    const bakedTexture = useTexture('/models/Baked_02.jpg')
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