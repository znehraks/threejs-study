// eslint-disable-next-line import/export
// export * from './packages/player/src/index';

// add styles
// import './style.css';
// three.js
import * as THREE from 'three';

// import { init_circle } from './circle/archiCircle';
// import { useState } from 'react';
// import { Scene } from 'three';
import { Vector2 } from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {
  makeCircle,
  drawCircle,
  getCircle,
  isTwoDimensionalArchiLine,
} from './CircleUtils';
// import { getIntersection } from '@/mori/EditShape';
import { getInteractionBetweenShape, archiLineToMesh } from './EditShape';
import { init_circle } from './ArchiCircle';
import { makeSquare, drawSquare, makeSqaureLine } from './PolygonUtils';
import { useEffect } from 'react';

export const Draw = () => {
  useEffect(() => {
    // create the scene
    const scene = new THREE.Scene();
    // create the camera

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enabled = true;

    // init_circle();
    // function Init()
    // {
    //   const [scene, setScene] = useState(new THREE.Scene());
    // const width = window.innerWidth - 1;
    // const height = window.innerHeight - 1;
    //   const [camera, setCamera] = useState(new THREE.PerspectiveCamera(75, width/height, 1, 10000));
    //   const [renderer, setRenderer] = useState(new THREE.WebGLRenderer());

    //   return [scene,setScene,camera,setCamera,renderer,setRenderer];
    // }

    // const [scene,setScene,camera,setCamera,renderer,setRenderer] = Init();

    // set size
    // renderer.setSize(window.innerWidth, window.innerHeight);

    // add canvas to dom
    document.body.appendChild(renderer.domElement);

    // add axis to the scene
    const axis = new THREE.AxesHelper(10);

    scene.add(axis);

    // add lights
    const light1 = new THREE.SpotLight();
    light1.position.set(2.5, 5, 5);
    light1.angle = Math.PI / 4;
    light1.penumbra = 0.5;
    light1.castShadow = true;
    light1.shadow.mapSize.width = 1024;
    light1.shadow.mapSize.height = 1024;
    light1.shadow.camera.near = 0.5;
    light1.shadow.camera.far = 20;
    scene.add(light1);
    //
    const light2 = new THREE.SpotLight();
    light2.position.set(-2.5, 5, 5);
    light2.angle = Math.PI / 4;
    light2.penumbra = 0.5;
    light2.castShadow = true;
    light2.shadow.mapSize.width = 1024;
    light2.shadow.mapSize.height = 1024;
    light2.shadow.camera.near = 0.5;
    light2.shadow.camera.far = 20;
    scene.add(light2);

    const light3 = new THREE.SpotLight();
    light3.position.set(-2.5, -10, -10);
    light3.angle = Math.PI / 4;
    light3.penumbra = 0.5;
    light3.castShadow = true;
    light3.shadow.mapSize.width = 1024;
    light3.shadow.mapSize.height = 1024;
    light3.shadow.camera.near = 0.5;
    light3.shadow.camera.far = 10;
    scene.add(light3);

    const light4 = new THREE.SpotLight();
    light4.position.set(8, -5, -5);
    light4.angle = Math.PI / 4;
    light4.penumbra = 0.5;
    light4.castShadow = true;
    light4.shadow.mapSize.width = 1024;
    light4.shadow.mapSize.height = 1024;
    light4.shadow.camera.near = 0.5;
    light4.shadow.camera.far = 20;
    scene.add(light4);

    const light5 = new THREE.SpotLight();
    light5.position.set(-2.5, -5, -10);
    light5.angle = Math.PI / 4;
    light5.penumbra = 0.5;
    light5.castShadow = true;
    light5.shadow.mapSize.width = 1024;
    light5.shadow.mapSize.height = 1024;
    light5.shadow.camera.near = 0.5;
    light5.shadow.camera.far = 20;
    scene.add(light5);

    const light6 = new THREE.SpotLight();
    light6.position.set(-7, -5, -5);
    light6.angle = Math.PI / 4;
    light6.penumbra = 0.5;
    light6.castShadow = true;
    light6.shadow.mapSize.width = 1024;
    light6.shadow.mapSize.height = 1024;
    light6.shadow.camera.near = 0.5;
    light6.shadow.camera.far = 20;
    scene.add(light6);

    const light7 = new THREE.SpotLight();
    light7.position.set(15, 5, 5);
    light7.angle = Math.PI / 4;
    light7.penumbra = 0.5;
    light7.castShadow = true;
    light7.shadow.mapSize.width = 1024;
    light7.shadow.mapSize.height = 1024;
    light7.shadow.camera.near = 0.5;
    light7.shadow.camera.far = 20;
    scene.add(light6);

    // grid Helper ------------------------------------------
    // const size = 100;
    // const divisions = 100;
    // const gridHelper = new THREE.GridHelper(size, divisions, 0xfffff0);
    // const gridHelper2 = new THREE.GridHelper(size, divisions, 0xfffff0);
    // gridHelper2.rotateX(Math.PI / 2);
    // scene.add(gridHelper);
    // scene.add(gridHelper2);
    // -------------------------------------------------------

    const [
      circle_left_point_mesh,
      circle_right_point_mesh,
      circle_change_point_upper_mesh,
      circle_change_point_lower_mesh,
      extrude_point_mesh,
      sqaure_point_1_mesh,
      sqaure_point_2_mesh,
      sqaure_point_3_mesh,
      sqaure_point_4_mesh,
    ] = init_circle();
    // 여기서 scene 은 이미 있는데 const 안하고 받는 방법 없나

    scene.add(circle_left_point_mesh);
    scene.add(circle_right_point_mesh);
    scene.add(circle_change_point_upper_mesh);
    scene.add(circle_change_point_lower_mesh);

    scene.add(extrude_point_mesh);
    scene.add(sqaure_point_1_mesh);
    scene.add(sqaure_point_2_mesh);
    scene.add(sqaure_point_3_mesh);
    scene.add(sqaure_point_4_mesh);

    const obj = [
      circle_left_point_mesh,
      circle_right_point_mesh,
      circle_change_point_upper_mesh,
      circle_change_point_lower_mesh,
      extrude_point_mesh,
      sqaure_point_1_mesh,
      sqaure_point_2_mesh,
      sqaure_point_3_mesh,
      sqaure_point_4_mesh,
    ];

    const extrude_dot_mesh = new THREE.Mesh();

    const dragControls = new DragControls(obj, camera, renderer.domElement);

    let fix_camera_x: number;
    let fix_camera_y: number;
    let fix_camera_z: number;

    dragControls.addEventListener('dragstart', function (_event) {
      // event.object.material.emissive.set( 0xaaaaaa );
      fix_camera_x = camera.position.x;
      fix_camera_y = camera.position.y;
      fix_camera_z = camera.position.z;
    });

    dragControls.addEventListener('drag', function (event) {
      // event.object.material.emissive.set( 0xaaaaaa );
      camera.position.x = fix_camera_x;
      camera.position.y = fix_camera_y;
      camera.position.z = fix_camera_z;

      if (event.object !== extrude_dot_mesh) {
        event.object.position.z = 0;
      } else {
        event.object.position.x = 0;
        event.object.position.y = 0;
      }
    });

    dragControls.addEventListener('dragend', function (event) {
      // event.object.material.emissive.set( 0xaaaaaa );
      clearScene();

      scene.add(circle_left_point_mesh);
      scene.add(circle_right_point_mesh);
      scene.add(circle_change_point_upper_mesh);
      scene.add(circle_change_point_lower_mesh);
      scene.add(sqaure_point_1_mesh);
      scene.add(sqaure_point_2_mesh);
      scene.add(sqaure_point_3_mesh);
      scene.add(sqaure_point_4_mesh);

      if (event.object === circle_left_point_mesh) {
        console.log(1);
        const circlePoints = [];
        circlePoints.push(
          new Vector2(
            circle_left_point_mesh.position.x,
            circle_left_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_right_point_mesh.position.x,
            circle_right_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_upper_mesh.position.x,
            circle_change_point_upper_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_lower_mesh.position.x,
            circle_change_point_lower_mesh.position.y
          )
        );

        const circleLines = getCircle(circlePoints);
        const circle_mesh = archiLineToMesh(circleLines);
        scene.add(circle_mesh);
        console.log('circleLines', circleLines);
        console.log('circle_left_point_mesh', circle_left_point_mesh);
      } else if (event.object === circle_right_point_mesh) {
        console.log(2);
        const circlePoints = [];
        circlePoints.push(
          new Vector2(
            circle_left_point_mesh.position.x,
            circle_left_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_right_point_mesh.position.x,
            circle_right_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_upper_mesh.position.x,
            circle_change_point_upper_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_lower_mesh.position.x,
            circle_change_point_lower_mesh.position.y
          )
        );
        const [circleShape, lineArcs] = makeCircle(circlePoints);
        console.log('lineArcs', lineArcs);
        console.log('circle_right_point_mesh', circle_right_point_mesh);
        scene.add(drawCircle(circleShape));
      } else if (event.object === circle_change_point_upper_mesh) {
        console.log(3);
        const circlePoints = [];
        circlePoints.push(
          new Vector2(
            circle_left_point_mesh.position.x,
            circle_left_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_right_point_mesh.position.x,
            circle_right_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_upper_mesh.position.x,
            circle_change_point_upper_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_lower_mesh.position.x,
            circle_change_point_lower_mesh.position.y
          )
        );
        const [circleShape, lineArcs] = makeCircle(circlePoints);
        console.log('lineArcs', lineArcs);
        console.log('circle_right_point_mesh', circle_right_point_mesh);
        scene.add(drawCircle(circleShape));

        // drawCircle();
        // drawPolygon2();
        // drawPolygon3();
        // make_line();
      } else if (event.object === circle_change_point_lower_mesh) {
        console.log(4);
        const circlePoints = [];
        circlePoints.push(
          new Vector2(
            circle_left_point_mesh.position.x,
            circle_left_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_right_point_mesh.position.x,
            circle_right_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_upper_mesh.position.x,
            circle_change_point_upper_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_lower_mesh.position.x,
            circle_change_point_lower_mesh.position.y
          )
        );
        const [circleShape, lineArcs] = makeCircle(circlePoints);
        scene.add(drawCircle(circleShape));
        console.log('lineArcs', lineArcs);
        console.log(
          'circle_change_point_lower_mesh',
          circle_change_point_lower_mesh
        );
      } else if (event.object === extrude_dot_mesh) {
        console.log(5);
        // drawPolygon();
        // drawPolygon2();
        // drawPolygon3();
        // getCircleSide();
        // make_line();
        console.log('extrude_dot_mesh', extrude_dot_mesh);
      } else if (event.object === sqaure_point_1_mesh) {
        console.log(6);
        // ========================= 자르기용 원 만들기 =================================== //

        const circlePoints = [];
        circlePoints.push(
          new Vector2(
            circle_left_point_mesh.position.x,
            circle_left_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_right_point_mesh.position.x,
            circle_right_point_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_upper_mesh.position.x,
            circle_change_point_upper_mesh.position.y
          )
        );
        circlePoints.push(
          new Vector2(
            circle_change_point_lower_mesh.position.x,
            circle_change_point_lower_mesh.position.y
          )
        );
        const circleLines = getCircle(circlePoints);

        // ========================= 자르기용 사각형 만들기 =================================== //
        const squarePoints = [];
        squarePoints.push(
          new Vector2(
            sqaure_point_1_mesh.position.x,
            sqaure_point_1_mesh.position.y
          )
        );
        squarePoints.push(
          new Vector2(
            sqaure_point_2_mesh.position.x,
            sqaure_point_2_mesh.position.y
          )
        );
        squarePoints.push(
          new Vector2(
            sqaure_point_3_mesh.position.x,
            sqaure_point_3_mesh.position.y
          )
        );
        squarePoints.push(
          new Vector2(
            sqaure_point_4_mesh.position.x,
            sqaure_point_4_mesh.position.y
          )
        );
        const squareShape = makeSquare(squarePoints);
        console.log('squareShape', squareShape);
        scene.add(drawSquare(squareShape));
        const squareLines = makeSqaureLine(squarePoints);
        console.log('squareLines', squareLines);
        // ========================= 사전 준비 완료 ========================================= //

        // 두 도형 Interaction 시작 //
        // const [int, diffA, diffB] = getInteractionBetweenShape(circleLines, squareLines);
        const res = getInteractionBetweenShape(circleLines, squareLines);
        clearScene();

        if (isTwoDimensionalArchiLine(res)) {
          for (const i of res) {
            const mesh = archiLineToMesh(i);
            scene.add(mesh);
          }
        } else {
          const mesh = archiLineToMesh(res);
          scene.add(mesh);
        }

        scene.add(circle_left_point_mesh);
        scene.add(circle_right_point_mesh);
        scene.add(circle_change_point_upper_mesh);
        scene.add(circle_change_point_lower_mesh);
        scene.add(sqaure_point_1_mesh);
        scene.add(sqaure_point_2_mesh);
        scene.add(sqaure_point_3_mesh);
        scene.add(sqaure_point_4_mesh);
      } else if (event.object === sqaure_point_2_mesh) {
        console.log(7);
        // ========================= 자르기용 원 만들기 =================================== //

        clearScene();
        scene.add(circle_left_point_mesh);
        scene.add(circle_right_point_mesh);
        scene.add(circle_change_point_upper_mesh);
        scene.add(circle_change_point_lower_mesh);
        scene.add(sqaure_point_1_mesh);
        scene.add(sqaure_point_2_mesh);
        scene.add(sqaure_point_3_mesh);
        scene.add(sqaure_point_4_mesh);
      } else if (event.object === sqaure_point_3_mesh) {
        console.log(8);
        // ========================= 자르기용 원 만들기 =================================== //
        clearScene();
        scene.add(circle_left_point_mesh);
        scene.add(circle_right_point_mesh);
        scene.add(circle_change_point_upper_mesh);
        scene.add(circle_change_point_lower_mesh);
        scene.add(sqaure_point_1_mesh);
        scene.add(sqaure_point_2_mesh);
        scene.add(sqaure_point_3_mesh);
        scene.add(sqaure_point_4_mesh);
      } else if (event.object === sqaure_point_4_mesh) {
        console.log(9);
        // ========================= 자르기용 원 만들기 =================================== //

        clearScene();
        scene.add(circle_left_point_mesh);
        scene.add(circle_right_point_mesh);
        scene.add(circle_change_point_upper_mesh);
        scene.add(circle_change_point_lower_mesh);
        scene.add(sqaure_point_1_mesh);
        scene.add(sqaure_point_2_mesh);
        scene.add(sqaure_point_3_mesh);
        scene.add(sqaure_point_4_mesh);
      }
      // } else if (event.object == polygon2_dot1_1_mesh) {
      // 	polygon2_dot1_1_mesh.position.set(event.object.position.x, event.object.position.y, event.object.position.z);
      // 	drawCircle();
      // 	drawPolygon();
      // 	drawPolygon2();
      // 	drawPolygon3();
      // 	getIntersectionWithPolygons();
      // 	make_line();
      // } else if (event.object == polygon2_dot1_2_mesh) {
      // 	polygon2_dot1_2_mesh.position.set(event.object.position.x, event.object.position.y, event.object.position.z);
      // 	drawCircle();
      // 	drawPolygon();
      // 	drawPolygon2();
      // 	drawPolygon3();
      // 	getIntersectionWithPolygons();
      // 	make_line();
      // } else if (event.object == polygon2_dot1_3_mesh) {
      // 	polygon2_dot1_3_mesh.position.set(event.object.position.x, event.object.position.y, event.object.position.z);
      // 	drawCircle();
      // 	drawPolygon();
      // 	drawPolygon2();
      // 	drawPolygon3();
      // 	getIntersectionWithPolygons();
      // } else if (event.object == polygon2_dot1_4_mesh) {
      // 	polygon2_dot1_4_mesh.position.set(event.object.position.x, event.object.position.y, event.object.position.z);
      // 	drawCircle();
      // 	drawPolygon();
      // 	drawPolygon2();
      // 	drawPolygon3();
      // 	getIntersectionWithPolygons();
      // }
    });

    // const circle_left_point_geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    // const circle_left_point_material = new THREE.MeshBasicMaterial( { color: 0xf42300 } );
    // const circle_left_point_mesh = new THREE.Mesh( start_dot_geometry, start_dot_material );
    // circle_left_point_mesh.position.set(x_left,0,y_left)

    // const end_dot_geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    // const end_dot_material = new THREE.MeshBasicMaterial( { color: 0x0000CC } );
    // const circle_right_point_mesh = new THREE.Mesh( end_dot_geometry, end_dot_material );
    // circle_right_point_mesh.position.set(x_right,0,y_right)

    // const third_dot_geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    // const third_dot_material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    // const circle_change_point_upper_mesh = new THREE.Mesh( third_dot_geometry, third_dot_material );
    // circle_change_point_upper_mesh.position.set(x3_upper,y3_upper,0)

    // const fourth_dot_geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    // const fourth_dot_material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    // const circle_change_point_lower_mesh = new THREE.Mesh( fourth_dot_geometry, fourth_dot_material );
    // circle_change_point_lower_mesh.position.set(x3_down,y3_down,0)

    // const extrude_dot_geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    // const extrude_dot_material = new THREE.MeshBasicMaterial( { color: 0xFF9999 } );
    // const extrude_dot_mesh = new THREE.Mesh( extrude_dot_geometry, extrude_dot_material );
    // extrude_dot_mesh.position.set(0,0,0)

    // const polygon_dot1_1_geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    // const polygon_dot1_1_material = new THREE.MeshBasicMaterial( { color: 0xFF9999 } );
    // const polygon_dot1_1_mesh = new THREE.Mesh( polygon_dot1_1_geometry, polygon_dot1_1_material );
    // polygon_dot1_1_mesh.position.set(1,1,0)

    // const polygon_dot1_2_geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    // const polygon_dot1_2_material = new THREE.MeshBasicMaterial( { color: 0xFF9999 } );
    // const polygon_dot1_2_mesh = new THREE.Mesh( polygon_dot1_2_geometry, polygon_dot1_2_material );
    // polygon_dot1_2_mesh.position.set(1,3,0)

    // const polygon_dot1_3_geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    // const polygon_dot1_3_material = new THREE.MeshBasicMaterial( { color: 0xFF9999 } );
    // const polygon_dot1_3_mesh = new THREE.Mesh( polygon_dot1_3_geometry, polygon_dot1_3_material );
    // polygon_dot1_3_mesh.position.set(3,3,0)

    // const polygon_dot1_4_geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    // const polygon_dot1_4_material = new THREE.MeshBasicMaterial( { color: 0xFF9999 } );
    // const polygon_dot1_4_mesh = new THREE.Mesh( polygon_dot1_4_geometry, polygon_dot1_4_material );
    // polygon_dot1_4_mesh.position.set(3,1,0)

    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xaaaaaa,
    //   wireframe: true,
    // });

    // create a box and add it to the scene
    // const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);

    // scene.add(box);

    // box.position.x = 0.5;
    // box.rotation.y = 0.5;

    camera.position.x = 50;
    camera.position.y = 200;
    camera.position.z = 500;

    camera.lookAt(scene.position);

    function animate(): void {
      requestAnimationFrame(animate);
      render();
    }

    function render(): void {
      //   const timer = 0.002 * Date.now();
      // box.position.y = 0.5 + 0.5 * Math.sin(timer);
      // box.rotation.x += 0.1;
      renderer.render(scene, camera);
    }

    animate();

    function clearScene() {
      const to_remove: THREE.Object3D<THREE.Event>[] | THREE.Mesh<any, any>[] =
        [];

      scene.traverse(function (child) {
        if (child instanceof THREE.Mesh && !child.userData.keepMe === true) {
          to_remove.push(child);
        }
      });

      for (let i = 0; i < to_remove.length; i += 1) {
        scene.remove(to_remove[i]);
      }
    }
  }, []);
  return <></>;
};
