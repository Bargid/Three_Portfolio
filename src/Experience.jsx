import React, { useRef, useState, useEffect, useMemo } from 'react';
import { shaderMaterial, OrbitControls, useGLTF, useTexture, Plane, PerspectiveCamera, Sparkles, Stars, Html } from '@react-three/drei'
// import { HTML } from '@react-three/drei';
import { EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing'
import { extend, useFrame } from '@react-three/fiber';
// import * as THREE from 'three';
import { Vector2, Vector3, MathUtils, Color, PlaneGeometry } from 'three';
import GUI from 'lil-gui';
import waterFragmentShader from './shaders/water/fragment.glsl';
import waterVertexShader from './shaders/water/vertex.glsl';
import { Water } from 'three/examples/jsm/objects/Water';
import { log } from 'three/examples/jsm/nodes/Nodes';
// import WaterScene from './WaterScene.jsx';
// import WaterShader from '/WaterShader.jsx'


export default function Experience() {

    // Camera ref
    const cameraRef = useRef();
    const controlsRef = useRef();

// Geometry and Textures --------------------------------------------------------------------------------------------------
    
    // House scene Import and loading
    const WaterMaterial = shaderMaterial( 
        {
            uTime: 0,
    
            uBigWavesElevation: 0.08,
            uBigWavesFrequency: new Vector2(1.52, 3.5),
            uBigWavesSpeed: 1.4,
    
            uSmallWavesElevation: 0.15,
            uSmallWavesFrequency: 2.46,
            uSmallWavesSpeed: 0.24,
            uSmallIterations: 1,
    
            uDepthColor: new Color('#1e00ff'),
            uSurfaceColor: new Color('#6b6aa0'),
            uColorOffset: 0.11,
            uColorMultiplier: 3
        },
        waterVertexShader,
        waterFragmentShader
    );
    
    extend({ WaterMaterial })
    
    // House,Island and lights geometry
    const { nodes } = useGLTF('./models/House_Scene.glb')
    const bakedObject = nodes.Baked;
    console.log(bakedObject);
    // console.log(nodes.Baked.position);


    // House scene texture
    const bakedTexture = useTexture('/models/Baked_02.jpg')
    bakedTexture.flipY = false

    // water geometry
    const waterGeometry = new PlaneGeometry(13, 2.8, 12, 1024)

    // waterMaterial
    const waterMaterial = useRef()
    useFrame((state, delta)=>
        {
            waterMaterial.current.uTime += delta
        }
    )

    // Custom Sparkle Color
    const colorYellow = "#e6cf25";

// Mouse Interaction --------------------------------------------------------------------------------------------------

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
            // cameraRef.current.position.x += (targetZ - cameraRef.current.position.z) * 0.1;

            // Ensure camera remains looking at the target
            cameraRef.current.lookAt(new Vector3(-2.8, 1.4, 1.2));
        }
    });

    // Target Z position for smooth zoom
    const targetX = useRef(7.1); // Start with the initial Z position

    // Event handler for wheel scroll
    const handleWheel = (event) => {
        // Adjust the target Z position based on scroll direction
        targetX.current += event.deltaY * 0.01; // Adjust sensitivity here
        targetX.current = MathUtils.clamp(targetX.current, 6.1, 8.1); // Clamp to a reasonable range
    };

    // Add the wheel event listener
    useEffect(() => {
        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    // Smoothly interpolate the camera's Z position
    useFrame(() => {
        if (cameraRef.current) {
            cameraRef.current.position.x += (targetX.current - cameraRef.current.position.x) * 0.1; // Adjust smoothing factor here
            cameraRef.current.lookAt(new Vector3(-2.8, 1.4, 1.2)); // Ensure the camera keeps looking at the target
        }
    });

    // Mouse Click and Hover

    function handleClick(event) {
        // Log the intersections array to check the information
        console.log(event.intersections); // Log to see what intersects
        
        // Filter intersections by mesh name
        const intersections = event.intersections.filter((intersect) =>
          intersect.object.userData.name === 'SpecificPart'
        );
      
        if (intersections.length > 0) {
          const intersection = intersections[0];
          const faceIndex = intersection.faceIndex; // Get the clicked face index
      
          // Check if the faceIndex is between 2 and 6 (exclusive)
          if (faceIndex > 20200 && faceIndex < 20250) {
            console.log(`Clicked on a the wooden arrow: ${faceIndex}`);
          }
        }
    }
    
    function handlePointerOver(event) {
        // Check if the hovered face is one of the desired faces
        const intersections = event.intersections.filter((intersect) =>
            intersect.object.userData.name === 'SpecificPart'
        );
        
        if (intersections.length > 0) {
            const intersection = intersections[0];
            const faceIndex = intersection.faceIndex;
        
            if (faceIndex > 20200 && faceIndex < 20251) {
            // Change cursor to hand on hover
            document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'default';
            }
            setHighlightedFace(intersection);
        }
    }

    function MeshWithHtmlOverlays({ bakedObject, bakedTexture }) {
        const [highlightedFace, setHighlightedFace] = useState(null); // Store highlighted face
        const { camera, viewport } = useThree(); // To convert 3D positions to screen space

    // Memoize the geometry for the hovered face
    const highlightedPosition = useMemo(() => {
        if (!highlightedFace) return new Vector3(0, 0, 0);

    // Get the selected face and its position
    const geometry = bakedObject.geometry;
    const face = geometry.faces[highlightedFace.faceIndex];
    const vertices = [
        geometry.vertices[face.a],
        geometry.vertices[face.b],
        geometry.vertices[face.c],
    ];

    // Calculate the center of the face (the average of the three vertices)
    const center = new Vector3();
    vertices.forEach((vertex) => {
        center.add(vertex);
    });
    center.divideScalar(3);
    
    return center;
    }, [highlightedFace, bakedObject.geometry]);

    // Convert 3D world position to 2D screen position
    const screenPosition = useMemo(() => {
    if (!highlightedPosition) return { x: 0, y: 0 };

    const pos = highlightedPosition.clone().project(camera);
    const x = (pos.x * 0.5 + 0.5) * viewport.width;
    const y = (pos.y * -0.5 + 0.5) * viewport.height;
    return { x, y };
    }, [highlightedPosition, camera, viewport]);

    // function handlePointerOut() {
    //     // Reset the cursor to default when leaving the mesh
    //     document.body.style.cursor = 'default';
    // }

// GUI --------------------------------------------------------------------------------------------------

    // debug object for GUI
    const debugObject = {

        // Water debug object
        uBigWavesElevation: 0.08,
        uBigWavesFrequency: new Vector2(1.52, 3.5),
        uBigWavesSpeed: 1.4,

        uSmallWavesElevation: 0.15,
        uSmallWavesFrequency: 2.46,
        uSmallWavesSpeed: 0.24,
        uSmallIterations: 1,

        uDepthColor: new Color('#0300ff'),
        uSurfaceColor: new Color('#252459'),
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
            {/* <axesHelper args={[20]} position={[0, 0, 0]} /> */}

            {/* Background */}
            <color args={['#201919']} attach="background" />

            <Stars 
                radius={100}      // Outer radius
                depth={25}        // Depth into the scene
                count={4000}      // Number of stars
                factor={5}        // Size of the stars
                saturation={0}    // Color saturation
                fade              // Fades near the edges of the view
            />

            {/* <group position={[0, 5, 0]}>
                <Cloud opacity={0.5} speed={0.2} width={6} depth={4} segments={5} />
            </group> */}

            {/* House and Island */}
            <mesh 
                geometry={bakedObject.geometry} 
                position={[
                    bakedObject.position.x,
                    bakedObject.position.y,
                    bakedObject.position.z
                ]}
                rotation={bakedObject.rotation}
                scale={bakedObject.scale}
                onClick = { handleClick } // On handle le click
                userData = {{ name: 'SpecificPart' }}
                onPointerOver = { handlePointerOver }
                // onPointerOut = { handlePointerOut }
                >
                <meshBasicMaterial map={bakedTexture} />
            </mesh>

            {/* HTML overlay (this is the element that will follow the face) */}
            {highlightedFace && (
                <Html
                position={[screenPosition.x, screenPosition.y, 0]} // Position it based on the 2D screen space
                distanceFactor={10} // Control how close or far the HTML element appears
                style={{
                    pointerEvents: 'none', // Prevent the HTML overlay from blocking 3D interactions
                    transform: 'translate(-50%, -50%)', // Center the HTML element
                }}
                >
                <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px', color: 'white' }}>
                    Face {highlightedFace.faceIndex} Hovered!
                </div>
                </Html>
            )}

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

            {/* Sparkles ou Fireflies */}

            <Sparkles
                count = { 10 }
                size = { 8 }
                scale = { [0.6, 0.2, 0.3] }
                position = { [2.7, 2.7, 1.8] }
                speed = { 0.6 }
                color = { colorYellow }
                opacity={ 0.6 }
                noise = { 100 }
            />

            <Sparkles 
                count = { 4 }
                size = { 8 }
                scale = { [0.2, 0.1, 0.2] }
                position = { [1.2, 1.2, 3.45] }
                speed = { 0.6 }
                color = { colorYellow }
                opacity={ 0.6 }
                noise = { 100 }
            />

            <Sparkles 
                count = { 100 }
                size = { 3 }
                scale = { [12, 0.5, 14] }
                position = { [-0.8, 0.6, -0.5] }
                speed = { 0.3 }
                // color = { colorYellow }
                opacity={ 0.6 }
                noise = { 100 }
            />

            {/* <EffectComposer>
                <Vignette
                    eskil={true}
                    offset={0.5}
                    darkness={1.5}
                    blendFunction={BlendFunction.NORMAL}
                />
            </EffectComposer> */}
    </>
};