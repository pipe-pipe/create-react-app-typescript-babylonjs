import React, { useState, useRef } from 'react';

import "@babylonjs/core/Physics/physicsEngineComponent"  // side-effect adds scene.enablePhysics function

import { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins'
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Nullable } from '@babylonjs/core/types';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { FresnelParameters } from '@babylonjs/core/Materials/fresnelParameters';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';

import { Scene, Engine } from 'react-babylonjs';
import './App.css';

import * as CANNON from 'cannon';
window.CANNON = CANNON;

const gravityVector = new Vector3(0, -9.81, 0);

const App: React.FC = () => {

  let sphereRef = useRef<Nullable<Mesh>>();

  const onButtonClicked = () => {
    if (sphereRef.current) {
      sphereRef.current.physicsImpostor!.applyImpulse(
        Vector3.Up().scale(10),
        sphereRef.current.getAbsolutePosition()
      );
    }
  };

  const [fontsReady, setFontsReady] = useState(false);
  const adtRef = useRef<AdvancedDynamicTexture | null>(null);
  const faLoaded = useRef(false);
  if (document.fonts.check("16px FontAwesome") === false) {
    document.fonts.load("16px FontAwesome").then(() => {
      if (faLoaded.current !== true && adtRef.current !== null) {
        faLoaded.current = true;

        setFontsReady(true);
        adtRef.current!.markAsDirty();
      }
    });
  } else if (faLoaded.current !== true) {
    faLoaded.current = true;
    setFontsReady(true);
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>@babylonjs + `react-babylonjs`</p>
        <Engine antialias={true} adaptToDeviceRatio={true} canvasId="sample-canvas">
          <Scene enablePhysics={[gravityVector, new CannonJSPlugin()]}>
            <arcRotateCamera name="arc" target={ new Vector3(0, 1, 0) }
                  alpha={-Math.PI / 2} beta={(0.5 + (Math.PI / 4))}
                  radius={4} minZ={0.001} wheelPrecision={50} 
                  lowerRadiusLimit={8} upperRadiusLimit={20} upperBetaLimit={Math.PI / 2} />
            <hemisphericLight name='hemi' direction={new Vector3(0, -1, 0)} intensity={0.8} />
            <directionalLight name="shadow-light" setDirectionToTarget={[Vector3.Zero()]} direction={Vector3.Zero()} position = {new Vector3(-40, 30, -40)}
              intensity={0.4} shadowMinZ={1} shadowMaxZ={2500}>
              {/* <shadowGenerator mapSize={1024} useBlurExponentialShadowMap={true} blurKernel={32} darkness={0.8}
                shadowCasters={["sphere1", "dialog"]} forceBackFacesOnly={true} depthScale={100} /> */}
            </directionalLight>
            <sphere ref={sphereRef} name="sphere1" diameter={2} segments={16} position={new Vector3(0, 1.5, 0)}>
              <physicsImpostor type={PhysicsImpostor.SphereImpostor} _options={{ mass: 1, restitution: 0.9 }} />
              <standardMaterial name='material1' specularPower={16}
                diffuseColor={Color3.Black()}
                emissiveColor={new Color3(0.5, 0.5, 0.5)}
                reflectionFresnelParameters={FresnelParameters.Parse({
                    isEnabled: true,
                    leftColor: [1, 1, 1],
                    rightColor: [0, 0, 0],
                    bias: 0.1,
                    power: 1
                })}
              />
              <plane name="dialog" size={2} position={new Vector3(0, 1.5, 0)} sideOrientation={Mesh.BACKSIDE}>
                <advancedDynamicTexture
                    name="dialogTexture"
                    ref={adtRef}
                    height={1024} width={1024}
                    createForParentMesh={true}
                    hasAlpha={true}
                    generateMipMaps={true}
                    samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
                  >
                    <rectangle name="rect-1" height={0.5} width={1} thickness={12} cornerRadius={12}>
                        <rectangle>
                            <babylon-button name="close-icon" background="green" onPointerDownObservable={onButtonClicked} >
                              <textBlock text={`${fontsReady ? '\uf00d' : 'X'} click me`} fontFamily='FontAwesome' fontStyle="bold" fontSize={200} color="white" />
                            </babylon-button>
                        </rectangle>
                    </rectangle>
                  </advancedDynamicTexture>
              </plane>
            </sphere>

            <ground name="ground1" width={10} height={10} subdivisions={2} receiveShadows={true}>
              <physicsImpostor type={PhysicsImpostor.BoxImpostor} _options={{ mass: 0, restitution: 0.9 }} />
            </ground>
            <vrExperienceHelper webVROptions={{ createDeviceOrientationCamera: false }} enableInteractions={true} />
          </Scene>
        </Engine>
      </header>
    </div>
  );
}
export default App;
