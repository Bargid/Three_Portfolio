import React, { useRef, useState, useEffect } from 'react';
import { shaderMaterial, OrbitControls, useGLTF, useTexture, Plane } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GUI from 'lil-gui';
// import waterFragmentShader from './shaders/water/fragment.glsl';
// import waterVertexShader from './shaders/water/vertex.glsl';
import { Water } from 'three/examples/jsm/Addons.js';
import { log } from 'three/examples/jsm/nodes/Nodes.js';
// import WaterScene from './WaterScene.jsx';
// import WaterShader from '/WaterShader.jsx'

export default function Experience() {

    // Variables

        let scene, clock, camera, renderer, renderTarget, depthMaterial;

        let water;

        let params = {
            foamColor: 0xffffff,
            waterColor: 0x14c6a5,
            threshold: 0.1
        };

    useEffect(() => {

        // Scene
            
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1e485e);
    
        // Clock
    
            clock = new THREE.Clock();
    
        // Camera
            
            camera = new THREE.PerspectiveCamera(
                70,
                window.innerWidth / window.innerHeight,
                0.1,
                100
            );
            camera.position.set(0, 7, 10);
    
        // House scene Import and loading
    
            const { nodes } = useGLTF('./models/House_Scene.glb')
            const bakedObject = nodes.Baked;
            const chuteTop = nodes.Chute_top;
    
            // House scene texture
            const bakedTexture = useTexture('/models/Baked_02.jpg')
            bakedTexture.flipY = false
    
        // water
    
            // Initialize Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.gammaOutput = true;
            document.body.appendChild(renderer.domElement);
    
            
            // initialize render target
            let pixelRatio = renderer.getPixelRatio();
            
            renderTarget = new THREE.WebGLRenderTarget(
                window.innerWidth * pixelRatio,
                window.innerHeight * pixelRatio
            );
            renderTarget.texture.minFilter = THREE.NearestFilter;
            renderTarget.texture.magFilter = THREE.NearestFilter;
            renderTarget.texture.generateMipmaps = false;
            renderTarget.stencilBuffer = false;
    
            // Check for deoth extension support
            const supportsDepthTextureExtension = !!renderer.extensions.get(
                "WEBGL_depth_texture"
            );
            if (supportsDepthTextureExtension === true) {
              renderTarget.depthTexture = new THREE.DepthTexture();
              renderTarget.depthTexture.type = THREE.UnsignedShortType;
              renderTarget.depthTexture.minFilter = THREE.NearestFilter;
              renderTarget.depthTexture.maxFilter = THREE.NearestFilter;
            }
    
            // initialize Depth Material
            depthMaterial = new THREE.MeshDepthMaterial();
            depthMaterial.depthPacking = THREE.RGBADepthPacking;
            depthMaterial.blending = THREE.NoBlending;
            
            // Dudv map for water material
            var dudvMap = new THREE.TextureLoader().load(
                "https://i.imgur.com/hOIsXiZ.png"
            );
            dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;
    
            // var uniforms = {
            //     time: {
            //     value: 0
            //     },
            //     threshold: {
            //     value: 0.1
            //     },
            //     tDudv: {
            //     value: null
            //     },
            //     tDepth: {
            //     value: null
            //     },
            //     cameraNear: {
            //     value: 0
            //     },
            //     cameraFar: {
            //     value: 0
            //     },
            //     resolution: {
            //     value: new THREE.Vector2()
            //     },
            //     foamColor: {
            //     value: new THREE.Color()
            //     },
            //     waterColor: {
            //     value: new THREE.Color()
            //     }
            // };
    
            // // Water material
    
            // var waterMaterial = new THREE.ShaderMaterial({
            //     defines: {
            //         DEPTH_PACKING: supportsDepthTextureExtension === true ? 0 : 1,
            //         ORTHOGRAPHIC_CAMERA: 0
            //     },
            //     uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib["fog"], uniforms]),
            //     vertexShader: document.getElementById("vertexShader").textContent,
            //     fragmentShader: document.getElementById("fragmentShader").textContent,
            //     fog: true
            // });
            
            // waterMaterial.uniforms.cameraNear.value = camera.near;
            // waterMaterial.uniforms.cameraFar.value = camera.far;
            // waterMaterial.uniforms.resolution.value.set(
            //     window.innerWidth * pixelRatio,
            //     window.innerHeight * pixelRatio
            // );
            // waterMaterial.uniforms.tDudv.value = dudvMap;
            // waterMaterial.uniforms.tDepth.value =
            // supportsDepthTextureExtension === true
            // ? renderTarget.depthTexture
            // : renderTarget.texture;
            
            // var waterGeometry = new THREE.PlaneGeometry(10, 3, 64, 1024);
            // water = new THREE.Mesh(waterGeometry, waterMaterial);
    
            // Water material
            
                const waterMaterial = new THREE.ShaderMaterial({
                    defines: {
                        DEPTH_PACKING: supportsDepthTextureExtension ? 0 : 1,
                        ORTHOGRAPHIC_CAMERA: 0
                    },
                    uniforms: {
                        time: { value: 0 },
                        threshold: { value: 0.1 },
                        tDudv: { value: dudvMap },
                        tDepth: { value: supportsDepthTextureExtension ? renderTarget.depthTexture : renderTarget.texture },
                        cameraNear: { value: camera.near },
                        cameraFar: { value: camera.far },
                        resolution: { value: new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio) },
                        foamColor: { value: new THREE.Color(params.foamColor) },
                        waterColor: { value: new THREE.Color(params.waterColor) }
                    },
                    vertexShader: `
                        #include <fog_pars_vertex>
        
                        varying vec2 vUv;
                
                        void main() {
                
                            vUv = uv;
                
                            #include <begin_vertex>
                            #include <project_vertex>
                            #include <fog_vertex>
                
                        }
                    `,
                    fragmentShader: `
                        #include <common>
                        #include <packing>
                        #include <fog_pars_fragment>
                
                        varying vec2 vUv;
                        uniform sampler2D tDepth;
                        uniform sampler2D tDudv;
                        uniform vec3 waterColor;
                        uniform vec3 foamColor;
                        uniform float cameraNear;
                        uniform float cameraFar;
                        uniform float time;
                        uniform float threshold;
                        uniform vec2 resolution;
                
                        float getDepth( const in vec2 screenPosition ) {
                            #if DEPTH_PACKING == 1
                                return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
                            #else
                                return texture2D( tDepth, screenPosition ).x;
                            #endif
                        }
                
                        float getViewZ( const in float depth ) {
                            #if ORTHOGRAPHIC_CAMERA == 1
                                return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
                            #else
                                return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
                            #endif
                        }
                
                        void main() {
                
                            vec2 screenUV = gl_FragCoord.xy / resolution;
                
                            float fragmentLinearEyeDepth = getViewZ( gl_FragCoord.z );
                            float linearEyeDepth = getViewZ( getDepth( screenUV ) );
                
                            float diff = saturate( fragmentLinearEyeDepth - linearEyeDepth );
                
                            vec2 displacement = texture2D( tDudv, ( vUv * 2.0 ) - time * 0.05 ).rg;
                            displacement = ( ( displacement * 2.0 ) - 1.0 ) * 1.0;
                            diff += displacement.x;
                
                            gl_FragColor.rgb = mix( foamColor, waterColor, step( threshold, diff ) );
                            gl_FragColor.a = 1.0;
                
                            #include <tonemapping_fragment>
                            #include <encodings_fragment>
                            #include <fog_fragment>
                
                        }
                    `,
                    fog: true
                });
    
        // Create water mesh
            const waterGeometry = new THREE.PlaneGeometry(10, 3, 64, 1024);
            water = new THREE.Mesh(waterGeometry, waterMaterial);
            water.position.set(0, -1.58, 0.5);
            scene.add(water);
    
        // GUI pannel
            const gui = new GUI({ width: 340 });
    
        // Add GUI controls for each parameter
            gui.addColor(params, "foamColor");
            gui.addColor(params, "waterColor");
            gui.add(params, "threshold", 0.1, 1);
            gui.open();
        
        // Animation and rendering loop using useFrame hook
    }, []);

    
        useFrame(() => {
            // Depth pass
            water.visible = false;
            scene.overrideMaterial = depthMaterial;
            renderer.setRenderTarget(renderTarget);
            renderer.render(scene, camera);
            renderer.setRenderTarget(null);
            scene.overrideMaterial = null;
            water.visible = true;
    
            // Beauty pass
            const time = clock.getElapsedTime();
            waterMaterial.uniforms.threshold.value = params.threshold;
            waterMaterial.uniforms.time.value = time;
            waterMaterial.uniforms.foamColor.value.set(params.foamColor);
            waterMaterial.uniforms.waterColor.value.set(params.waterColor);
            renderer.render(scene, camera);
        });
    
        return <>
    
            <OrbitControls makeDefault />
    
            {/* Background */}
            <color args={['#201919']} attach="background" />
    
            <mesh geometry={bakedObject.geometry} position={[0, -10, 0]}>
                <meshBasicMaterial map={bakedTexture} />
            </mesh>
    
             {/* Render the WaterScene component */}
             {/* <mesh
                geometry={ waterGeometry }
                position={[ 0, -1.58, 0.5 ]}
                rotation={[ -Math.PI / 2, 0, 0 ]}
             >
                <waterMaterial ref={ waterMaterial }/>*/}
    
                <mesh geometry={waterGeometry} material={waterMaterial} position={[0, -1.58, 0.5]}>
                </mesh>
             
            
        </>
    };
    
    function animate() {
        requestAnimationFrame(animate);
      
        // depth pass
      
        water.visible = false; // we don't want the depth of the water
        scene.overrideMaterial = depthMaterial;
      
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
      
        scene.overrideMaterial = null;
        water.visible = true;
      
        // beauty pass
      
        var time = clock.getElapsedTime();
      
        water.material.uniforms.threshold.value = params.threshold;
        water.material.uniforms.time.value = time;
        water.material.uniforms.foamColor.value.set(params.foamColor);
        water.material.uniforms.waterColor.value.set(params.waterColor);
      
        renderer.render(scene, camera);
      }

    