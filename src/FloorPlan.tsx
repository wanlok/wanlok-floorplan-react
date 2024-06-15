import { useEffect, useRef } from "react";
import { FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3DEventMap,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";
import * as TWEEN from "@tweenjs/tween.js";
// import * as interfaces from './interfaces';
// import { getNewAnnotation } from './meshs';
import { MouseEventManager } from "@masatomakino/threejs-interactive-object";

import bg from "./assets/images/bg.jpg";
import model from "./assets/models/model.fbx";

let profileIndex: number = 1;
const transitTime = 1500;
const viewLockDuration: number = 10;
let viewLockTimestamp: number = Date.now() / 1000 - viewLockDuration;

const profiles: number[][] = [[-24, 24, 24]];

const focusPositions: number[][] = [[0, 0, 0]];

function getLoader(filePath: string) {
  var loader = null;
  var fileExtension = null;
  const slices = filePath.split(".");
  if (slices.length > 0) {
    fileExtension = slices[slices.length - 1];
  }
  if (fileExtension === "fbx") {
    loader = new FBXLoader();
  }
  return loader;
}

function loadModel(
  filePath: string,
  successCallback: (object: Group<Object3DEventMap>) => void
) {
  const loader = getLoader(filePath);
  if (loader != null) {
    loader.load(
      filePath,
      function (object) {
        successCallback(object);
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        console.log("Error: " + error);
      }
    );
  }
}

function animateCamera(
  camera: PerspectiveCamera,
  newPosition: number[],
  time: number,
  focus: number[]
) {
  new TWEEN.Tween(camera.position)
    .to(
      {
        x: newPosition[0],
        y: newPosition[1],
        z: newPosition[2],
      },
      time
    )
    .onUpdate(() => {
      camera.lookAt(new Vector3(...focus));
    })
    .start();
  const animate = () => {
    requestAnimationFrame(animate);
    TWEEN.update();
  };
  animate();
}

function changeView(camera: PerspectiveCamera) {
  if (Date.now() / 1000 - viewLockTimestamp > viewLockDuration) {
    profileIndex %= profiles.length;
    animateCamera(
      camera,
      profiles[profileIndex],
      transitTime,
      focusPositions[0]
    );
    profileIndex += 1;
  }
}

function getBackground() {
  const background = new SphereGeometry(500, 60, 40);
  background.scale(-1, 1, 1);
  const mesh = new Mesh(
    background,
    new MeshBasicMaterial({
      map: new TextureLoader().load(bg),
    })
  );
  return mesh;
}

function getAmbientLight() {
  return new AmbientLight(0xffffff, 1);
}

function getDirectionalLight() {
  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 0, 1).normalize();
  return directionalLight;
}

function FloorPlanModel() {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(function () {
    loadModel(model, function (object) {
      const camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (
        divRef.current &&
        divRef.current.children &&
        divRef.current.children.length === 0
      ) {
        divRef.current.appendChild(renderer.domElement);
      }

      const scene = new Scene();
      scene.add(getAmbientLight());
      //   scene.add(getDirectionalLight());

      //   object.rotateX(-Math.PI / 2);

      object.scale.set(0.04, 0.04, 0.04);

      const box = new Box3().setFromObject(object);
      const center = box.getCenter(new Vector3());

      object.position.x += object.position.x - center.x;
      object.position.y += object.position.y - center.y;
      object.position.z += object.position.z - center.z;

      scene.add(object);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener("change", () => {
        viewLockTimestamp = Date.now() / 1000;
      });

      scene.add(getBackground());

      new MouseEventManager(scene, camera, renderer.domElement);

      // const annotations: interfaces.clickables[] = [
      //     { position: new Vector3(18, 10, -45), zone: 1, group: 14, type: 'light', power: true },
      //     { position: new Vector3(11.75, 10, -45), zone: 2, group: 15, type: 'light', power: true },
      //     { position: new Vector3(5, 10, -45), zone: 3, group: 16, type: 'light', power: true },
      //     { position: new Vector3(18, 10, -45), zone: 4, group: 18, type: 'light', power: true },
      //     { position: new Vector3(0, 10, -33), zone: 5, group: 19, type: 'light', power: true },
      //     { position: new Vector3(-4, 10, -30), zone: 6, group: 20, type: 'light', power: true },
      //     { position: new Vector3(4, 10, -30), zone: 7, group: 26, type: 'light', power: true },
      //     { position: new Vector3(-4, 10, -23), zone: 8, group: 27, type: 'light', power: true },
      //     { position: new Vector3(4, 10, -23), zone: 9, group: 28, type: 'light', power: true },
      //     { position: new Vector3(-12, 10, -16), zone: 10, group: 30, type: 'light', power: true },
      //     { position: new Vector3(-4, 10, -16), zone: 11, group: 31, type: 'light', power: true },
      //     { position: new Vector3(4, 10, -16), zone: 12, group: 32, type: 'light', power: true },
      //     { position: new Vector3(-12, 10, -33), zone: 13, group: 38, type: 'light', power: true },
      //     { position: new Vector3(-12, 10, -23), zone: 14, group: 39, type: 'light', power: true },
      //     { position: new Vector3(-12, 10, -30), zone: 15, group: 40, type: 'light', power: true },
      //     { position: new Vector3(20, 10, -55), type: 'cctv', id: 'first' },
      //     { position: new Vector3(-7, 10, -19), type: 'cctv', id: 'second' },
      //     { position: new Vector3(-11, 10, 39), type: 'cctv', id: 'third' }
      // ];

      // annotations.forEach((annotation) => {
      //     annotation.mesh = getNewAnnotation(annotation, scene);
      // });

      animateCamera(camera, profiles[0], transitTime, focusPositions[0]);
      setInterval(() => changeView(camera), 10000);

      const animate = function (t?: any) {
        TWEEN.update(t);
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      const resize = function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", resize);

      return function () {
        window.removeEventListener("resize", resize);
        if (divRef.current && divRef.current.children) {
          while (divRef.current.children.length > 0) {
            divRef.current.removeChild(renderer.domElement);
          }
        }
        renderer.dispose();
      };
    });
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
      }}
    ></div>
  );
}

export default FloorPlanModel;
