import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DirectionalLight } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader, OBJLoader } from "three/examples/jsm/Addons.js";

var scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);

function getAmbientLight() {
  return new THREE.AmbientLight(0xffffff, 0.9);
}

function getDirectionalLight() {
  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 1).normalize();
  return directionalLight;
}

function FloorPlan() {
  const divRef = useRef<HTMLDivElement>(null);

  var getLoader = function (filePath: string) {
    var loader = null;
    var fileExtension = null;
    const slices = filePath.split(".");
    if (slices.length > 0) {
      fileExtension = slices[slices.length - 1];
    }
    if (fileExtension == "obj") {
      console.log("OBJLoader");
      loader = new OBJLoader();
    } else if (fileExtension == "fbx") {
      console.log("FBXLoader");
      loader = new FBXLoader();
    }
    return loader;
  };

  var loadModel = function (
    filePath: string,
    successCallback: (
      object: THREE.Group<THREE.Object3DEventMap>,
      z: number
    ) => void
  ) {
    const loader = getLoader(filePath);
    if (loader != null) {
      loader.load(
        filePath,
        function (object) {
          successCallback(object, 2000);
        },
        function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        function (error) {
          console.log("Error: " + error);
        }
      );
    }
  };

  var clearDivRef = function () {
    if (divRef.current && divRef.current.children) {
      while (divRef.current.children.length > 0) {
        divRef.current.removeChild(divRef.current.children[0]);
      }
    }
  };

  useEffect(function () {
    // // const stopThrehold = 0.5;
    // // let prevPosition: number[] = profiles[profileIndex];
    // // const focusPosition: number[] = focusPositions[profileIndex];
    // const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();

    // if (
    //   divRef.current &&
    //   divRef.current.children &&
    //   divRef.current.children.length == 0
    // ) {
    //   divRef.current.appendChild(renderer.domElement);
    // }

    // // const manager = new MouseEventManager(scene, camera, renderer.domElement);
    // // console.log(manager);
    // renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setSize(window.innerWidth, window.innerHeight);

    // // camera.position.x = profiles[profileIndex][0];
    // // camera.position.y = profiles[profileIndex][1];
    // // camera.position.z = profiles[profileIndex][2];

    // // renderer.render(scene, camera);

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.addEventListener("change", () => {
    //   // viewLockTimestamp = Date.now() / 1000;
    // });

    // // const axisHelper = new THREE.AxesHelper(250);
    // // scene.add(axisHelper);

    // fbxLoader.load("models/WSP_compress.fbx", (obj) => {
    //   obj.scale.set(0.01, 0.01, 0.01);
    //   obj.rotateY(-Math.PI);
    //   scene.add(obj);
    // });

    // scene.add(getAmbientLight());

    // // animateCamera(camera, profiles[0], transitTime, focusPositions[0]);
    // // setInterval(changeView, 10000);

    // const animate = (t?: any) => {
    //   // TWEEN.update(t);
    //   requestAnimationFrame(animate);
    //   // camera.lookAt(new THREE.Vector3(focusPosition[0], focusPosition[1], focusPosition[2]));
    //   // const diff: number[] = getVector3Difference(prevPosition, profiles[profileIndex], stopThrehold);
    //   // camera.position.x += diff[0] / 50 > 0.3 ? 0.3 : diff[0] / 50;
    //   // camera.position.y += diff[1] / 50 > 0.3 ? 0.3 : diff[1] / 50;
    //   // camera.position.z += diff[2] / 50 > 0.3 ? 0.3 : diff[2] / 50;
    //   // prevPosition = camera.position.toArray();
    //   // const focusDiff = getVector3Difference(focusPosition, focusPositions[profileIndex], stopThrehold);
    //   // focusPosition[0] += focusDiff[0] / 60;
    //   // focusPosition[1] += focusDiff[1] / 60;
    //   // focusPosition[2] += focusDiff[2] / 60;
    //   // camera.lookAt(new THREE.Vector3(focusPosition[0], focusPosition[1], focusPosition[2]));
    //   // // changePosition();
    //   // // controls.update()
    //   // renderer.setPixelRatio(window.devicePixelRatio);
    //   // renderer.setSize(window.innerWidth, window.innerHeight);
    //   renderer.render(scene, camera);
    // };
    // animate();

    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (divRef.current) {
      clearDivRef();
      divRef.current.appendChild(renderer.domElement);

      loadModel("models/PVPanelRemovedPeople-3DView-{3D}.fbx", function (object, z) {
        scene.add(getAmbientLight());
        scene.add(getDirectionalLight());
        scene.add(object);
        camera.position.z = z;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        var dragging = false;
        var startDragging = function () {
          dragging = true;
        };
        controls.addEventListener("start", startDragging);
        var endDragging = function () {
          dragging = false;
        };
        controls.addEventListener("end", endDragging);
        var animate = function () {
          requestAnimationFrame(animate);
          if (!dragging) {
            object.rotation.x += 0.01;
            object.rotation.y += 0.01;
          }
          renderer.render(scene, camera);
        };
        animate();
        var resize = function () {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", resize);
        return function () {
          window.removeEventListener("resize", resize);
          controls.removeEventListener("end", endDragging);
          controls.removeEventListener("start", startDragging);
          if (divRef.current && divRef.current.children) {
            while (divRef.current.children.length > 0) {
              divRef.current.removeChild(renderer.domElement);
            }
          }
          renderer.dispose();
        };
      });
    }
  }, []);

  return <div ref={divRef}></div>;
}

export default FloorPlan;
