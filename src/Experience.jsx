import React, { useRef, useState, useEffect } from 'react';
import { shaderMaterial, OrbitControls, useGLTF, useTexture, Plane, PerspectiveCamera } from '@react-three/drei'
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

    // Camera ref
    const cameraRef = useRef();
    const controlsRef = useRef();

    // const initialCameraPosition = [7.1, 2.5, 4.7];
    // const initialTarget = [-2.8, 1.4, 1.2];

    // // Force OrbitControls to update after setting initial position and target
    // useEffect(() => {
    // if (controlsRef.current) {
    //     const controls = controlsRef.current;
    //     controls.object.position.set(...initialCameraPosition);
    //     controls.target.set(...initialTarget);
    //     controls.update(); // Force OrbitControls to update its state
    //     }
    // }, []); // Run once on mount

// --------------------------------------------------------------------------------------------------

    // // Track les mouvements de souris pour Parallax
    // const mouse = useRef({ x: 0, y: 0 });
    // const handleMouseMove = (event) => {
    //     mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    //     mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // };
    // React.useEffect(() => {
    //     window.addEventListener('mousemove', handleMouseMove);
    //     return () => window.removeEventListener('mousemove', handleMouseMove);
    // }, []);

    // // Effet Parallax
    // useFrame(() => {
    //     if (cameraRef.current) {
    //         const parallaxStrength = 1; // Adjust the intensity of the parallax
    //         cameraRef.current.position.z = -2.8 + -mouse.current.x * parallaxStrength;
    //         cameraRef.current.position.y = 2.5 + -mouse.current.y * parallaxStrength;
    //     }
    // });

    // useFrame(() => {
    //     if (cameraRef.current) {
    //         const parallaxStrength = 1; // Adjust the intensity of the parallax
    //         const targetZ = 7.1 + mouse.current.x * parallaxStrength;
    //         const targetY = 2.5 + mouse.current.y * parallaxStrength;
    //         // const targetZ = -2.8 + mouse.current.z * parallaxStrength;

    //         // Smooth transition using interpolation
    //         cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.1;
    //         cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.1;
    //         // cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.1;

    //         // Ensure camera remains looking at the target
    //         cameraRef.current.lookAt(-2.8, 1.4, 1.2);
    //     }
    // });

        // Track mouse movement
        const mouse = useRef({ x: 0, y: 0 });
        const handleMouseMove = (event) => {
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1; // Normalized X
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1; // Normalized Y
        };
    
        useEffect(() => {
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }, []);
    
        // Apply parallax effect
        useFrame(() => {
            if (cameraRef.current) {
                const parallaxStrength = 0.3; // Adjust intensity
                const targetY = 2.5 + mouse.current.y * parallaxStrength;
                const targetZ = 4.7 + mouse.current.x * parallaxStrength;
    
                // Smooth interpolation
                cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.1;
                cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.1;
    
                // Ensure camera remains looking at the target
                cameraRef.current.lookAt(new THREE.Vector3(-2.8, 1.4, 1.2));
            }
        });

// --------------------------------------------------------------------------------------------------
    
    // House scene Import and loading
    const WaterMaterial = shaderMaterial( 
        {
            uTime: 0,
    
            uBigWavesElevation: 0.08,
            uBigWavesFrequency: new THREE.Vector2(1.52, 3.5),
            uBigWavesSpeed: 1.4,
    
            uSmallWavesElevation: 0.15,
            uSmallWavesFrequency: 2.46,
            uSmallWavesSpeed: 0.24,
            uSmallIterations: 1,
    
            uDepthColor: new THREE.Color('#1e00ff'),
            uSurfaceColor: new THREE.Color('#6b6aa0'),
            uColorOffset: 0.11,
            uColorMultiplier: 3
        },
        waterVertexShader,
        waterFragmentShader
    );
    
    extend({ WaterMaterial })
    
    // House,Island and lights geometry
    const { nodes } = useGLTF('./models/House_Scene.glb')
    // console.log(nodes.Window_emission);
    const bakedObject = nodes.Baked;
    console.log(nodes.Baked.position);
    // console.log(nodes);

    // House scene texture
    const bakedTexture = useTexture('/models/Baked_02.jpg')
    bakedTexture.flipY = false

    // Emissve Lights
    

    // water geometry
    const waterGeometry = new THREE.PlaneGeometry(13, 2.8, 12, 1024)

    // waterMaterial
    const waterMaterial = useRef()
    useFrame((state, delta)=>
        {
            waterMaterial.current.uTime += delta
        }
    )

    // debug object for GUI
    const debugObject = {

        // Water debug object
        uBigWavesElevation: 0.08,
        uBigWavesFrequency: new THREE.Vector2(1.52, 3.5),
        uBigWavesSpeed: 1.4,

        uSmallWavesElevation: 0.15,
        uSmallWavesFrequency: 2.46,
        uSmallWavesSpeed: 0.24,
        uSmallIterations: 1,

        uDepthColor: new THREE.Color('#0300ff'),
        uSurfaceColor: new THREE.Color('#252459'),
        uColorOffset: 0.11,
        uColorMultiplier: 3,

        // Camera debug object
        cameraPositionX: 7.1,
        cameraPositionY: 2.5,
        cameraPositionZ: 4.7,
        cameraRotationX: 0,
        cameraRotationY: 0,
        cameraRotationZ: 0,
        cameraFov: 47,

        // Camera target
        targetX: -2.8,
        targetY: 1.4,
        targetZ: 1.2,

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

    // Camera GUI

    gui.add(debugObject, 'cameraPositionX').min(-20).max(20).step(0.1).name('Camera Pos X').onChange(() => {
        if (cameraRef.current) cameraRef.current.position.x = debugObject.cameraPositionX;
    });
    gui.add(debugObject, 'cameraPositionY').min(-20).max(20).step(0.1).name('Camera Pos Y').onChange(() => {
        if (cameraRef.current) cameraRef.current.position.y = debugObject.cameraPositionY;
    });
    gui.add(debugObject, 'cameraPositionZ').min(-50).max(50).step(0.1).name('Camera Pos Z').onChange(() => {
        if (cameraRef.current) cameraRef.current.position.z = debugObject.cameraPositionZ;
    });
    gui.add(debugObject, 'cameraRotationX').min(0).max(Math.PI * 2).step(0.01).name('Camera Rot X').onChange(() => {
        if (cameraRef.current) cameraRef.current.rotation.x = debugObject.cameraRotationX;
    });
    gui.add(debugObject, 'cameraRotationY').min(0).max(Math.PI * 2).step(0.01).name('Camera Rot Y').onChange(() => {
        if (cameraRef.current) cameraRef.current.rotation.y = debugObject.cameraRotationY;
    });
    gui.add(debugObject, 'cameraRotationZ').min(0).max(Math.PI * 2).step(0.01).name('Camera Rot Z').onChange(() => {
        if (cameraRef.current) cameraRef.current.rotation.z = debugObject.cameraRotationZ;
    });
    gui.add(debugObject, 'cameraFov').min(10).max(100).step(1).name('Camera FOV').onChange(() => {
        if (cameraRef.current) {
            cameraRef.current.fov = debugObject.cameraFov;
            cameraRef.current.updateProjectionMatrix();  // Make sure the camera updates after the change
        }
    });

    gui.add(debugObject, 'targetX').min(-20).max(20).step(0.1).name('Target Pos X').onChange(() => {
        if (controlsRef.current) {
            controlsRef.current.target.set(debugObject.targetX, debugObject.targetY, debugObject.targetZ);
            controlsRef.current.update();  // Make sure the controls are updated with the new target
        }
    });
    
    gui.add(debugObject, 'targetY').min(-20).max(20).step(0.1).name('Target Pos Y').onChange(() => {
        if (controlsRef.current) {
            controlsRef.current.target.set(debugObject.targetX, debugObject.targetY, debugObject.targetZ);
            controlsRef.current.update();
        }
    });
    
    gui.add(debugObject, 'targetZ').min(-50).max(50).step(0.1).name('Target Pos Z').onChange(() => {
        if (controlsRef.current) {
            controlsRef.current.target.set(debugObject.targetX, debugObject.targetY, debugObject.targetZ);
            controlsRef.current.update();
        }
    });

        // // Update GUI controls to interact with OrbitControls camera
        // gui.add(debugObject, 'cameraPositionX').min(-20).max(20).step(0.1).name('Camera Pos X').onChange(() => {
        //     if (controlsRef.current) controlsRef.current.object.position.x = debugObject.cameraPositionX;
        // });
        // gui.add(debugObject, 'cameraPositionY').min(-20).max(20).step(0.1).name('Camera Pos Y').onChange(() => {
        //     if (controlsRef.current) controlsRef.current.object.position.y = debugObject.cameraPositionY;
        // });
        // gui.add(debugObject, 'cameraPositionZ').min(-50).max(50).step(0.1).name('Camera Pos Z').onChange(() => {
        //     if (controlsRef.current) controlsRef.current.object.position.z = debugObject.cameraPositionZ;
        // });
        // gui.add(debugObject, 'cameraRotationX').min(0).max(Math.PI * 2).step(0.01).name('Camera Rot X').onChange(() => {
        //     if (controlsRef.current) controlsRef.current.object.rotation.x = debugObject.cameraRotationX;
        // });
        // gui.add(debugObject, 'cameraRotationY').min(0).max(Math.PI * 2).step(0.01).name('Camera Rot Y').onChange(() => {
        //     if (controlsRef.current) controlsRef.current.object.rotation.y = debugObject.cameraRotationY;
        // });
        // gui.add(debugObject, 'cameraRotationZ').min(0).max(Math.PI * 2).step(0.01).name('Camera Rot Z').onChange(() => {
        //     if (controlsRef.current) controlsRef.current.object.rotation.z = debugObject.cameraRotationZ;
        // });
        // gui.add(debugObject, 'cameraFov').min(10).max(100).step(1).name('Camera FOV').onChange(() => {
        //     if (controlsRef.current) {
        //         controlsRef.current.object.fov = debugObject.cameraFov;
        //         controlsRef.current.object.updateProjectionMatrix(); // Ensure camera updates
        //     }
        // });
    
        // // Add target controls
        // gui.add(debugObject, 'targetX').min(-20).max(20).step(0.1).name('Target Pos X').onChange(() => {
        //     if (controlsRef.current) {
        //         controlsRef.current.target.set(debugObject.targetX, debugObject.targetY, debugObject.targetZ);
        //         controlsRef.current.update();
        //     }
        // });
    
        // gui.add(debugObject, 'targetY').min(-20).max(20).step(0.1).name('Target Pos Y').onChange(() => {
        //     if (controlsRef.current) {
        //         controlsRef.current.target.set(debugObject.targetX, debugObject.targetY, debugObject.targetZ);
        //         controlsRef.current.update();
        //     }
        // });
    
        // gui.add(debugObject, 'targetZ').min(-50).max(50).step(0.1).name('Target Pos Z').onChange(() => {
        //     if (controlsRef.current) {
        //         controlsRef.current.target.set(debugObject.targetX, debugObject.targetY, debugObject.targetZ);
        //         controlsRef.current.update();
        //     }
        // });
    

    return <>
        {/* <OrbitControls ref={controlsRef}
                       makeDefault
                       position = {[7.1, 2.5, 4.7]}
                       target={[-2.8, 1.4, 1.2]}
        /> */}

        {/* Camera */}
        <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position = {[7.1, 2.5, 4.7]}
            target={[-2.8, 1.4, 1.2]}
            // position={[debugObject.cameraPositionX, debugObject.cameraPositionY, debugObject.cameraPositionZ]}
            // rotation={[debugObject.cameraRotationX, debugObject.cameraRotationY, debugObject.cameraRotationZ]}
            // fov={debugObject.cameraFov}
        />

        {/* Axes Helper */}
        <axesHelper args={[20]} position={[0, 0, 0]} />

        {/* Background */}
        <color args={['#201919']} attach="background" />

        {/* House and Island */}
        <mesh 
            geometry={bakedObject.geometry} 
            position={[
                bakedObject.position.x,
                bakedObject.position.y,
                bakedObject.position.z
            ]}
            rotation={bakedObject.rotation}
            scale={bakedObject.scale}>
            <meshBasicMaterial map={bakedTexture} />
        </mesh>

        {/* Lights geometries */}
        <mesh 
            geometry={nodes.Circle_emission.geometry}
            position={nodes.Circle_emission.position}
            rotation={nodes.Circle_emission.rotation}
            scale={nodes.Circle_emission.scale}
            >
                <meshBasicMaterial color="#ffffe5" />
        </mesh>

        <mesh
            geometry={nodes.Door_emission.geometry}
            position={nodes.Door_emission.position}
            rotation={nodes.Door_emission.rotation}
            scale={nodes.Door_emission.scale}
            >
                <meshBasicMaterial color="#ffffe5" />
        </mesh>

        <mesh
            geometry={nodes.OverDoor_emission.geometry}
            position={nodes.OverDoor_emission.position}
            rotation={nodes.OverDoor_emission.rotation}
            scale={nodes.OverDoor_emission.scale}
            >
                <meshBasicMaterial color="#ffffe5" />
        </mesh>

        <mesh
            geometry={nodes.Window_emission.geometry}
            position={nodes.Window_emission.position}
            rotation={nodes.Window_emission.rotation}
            scale={nodes.Window_emission.scale}
            >
                <meshBasicMaterial color="#ffffe5" />
        </mesh>

        <mesh
            geometry={nodes.Poteau_emission.geometry}
            position={nodes.Poteau_emission.position}
            rotation={nodes.Poteau_emission.rotation}
            scale={nodes.Poteau_emission.scale}
            >
                <meshBasicMaterial color="#ffffe5" />
        </mesh>

         {/* Water */}
         <mesh
            geometry={ waterGeometry }
            position={[ -0.6, 0.15, -1 ]}
            rotation={[ -Math.PI / 2, 0, 0 ]}
         >
            <waterMaterial ref={ waterMaterial }/>
         </mesh>
        
    </>
};