import * as THREE from 'three';

export function init_circle() {
  // const scene = new THREE.Scene();

  const x_left = -100;
  const y_left = 0;

  const x_right = 100;
  const y_right = 0;

  const x_change_upper = 0;
  const y_change_upper = 100;

  const x_change_lower = 0;
  const y_change_lower = -100;

  const circle_left_point_geometry = new THREE.BoxGeometry(10, 10, 10);
  const circle_left_point_material = new THREE.MeshBasicMaterial({
    color: 0xf42333,
  });
  const circle_left_point_mesh = new THREE.Mesh(
    circle_left_point_geometry,
    circle_left_point_material
  );
  circle_left_point_mesh.position.set(x_left, 0, y_left);

  const circle_right_point_geometry = new THREE.BoxGeometry(10, 10, 10);
  const circle_right_point_material = new THREE.MeshBasicMaterial({
    color: 0x0000cc,
  });
  const circle_right_point_mesh = new THREE.Mesh(
    circle_right_point_geometry,
    circle_right_point_material
  );
  circle_right_point_mesh.position.set(x_right, 0, y_right);

  const circle_change_point_upper_geometry = new THREE.BoxGeometry(10, 10, 10);
  const circle_change_point_upper_material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
  });
  const circle_change_point_upper_mesh = new THREE.Mesh(
    circle_change_point_upper_geometry,
    circle_change_point_upper_material
  );
  circle_change_point_upper_mesh.position.set(
    x_change_upper,
    y_change_upper,
    0
  );

  const circle_change_point_lower_geometry = new THREE.BoxGeometry(10, 10, 10);
  const circle_change_point_lower_material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
  });
  const circle_change_point_lower_mesh = new THREE.Mesh(
    circle_change_point_lower_geometry,
    circle_change_point_lower_material
  );
  circle_change_point_lower_mesh.position.set(
    x_change_lower,
    y_change_lower,
    0
  );

  const extrude_dot_geometry = new THREE.BoxGeometry(10, 10, 10);
  const extrude_dot_material = new THREE.MeshBasicMaterial({ color: 0xff9999 });
  const extrude_dot_mesh = new THREE.Mesh(
    extrude_dot_geometry,
    extrude_dot_material
  );
  extrude_dot_mesh.position.set(0, 0, 0);

  const square_point1_1_geometry = new THREE.BoxGeometry(10, 10, 10);
  const square_point1_1_material = new THREE.MeshBasicMaterial({
    color: 0xff9999,
  });
  const square_point1_1_mesh = new THREE.Mesh(
    square_point1_1_geometry,
    square_point1_1_material
  );
  square_point1_1_mesh.position.set(100, 100, 0);

  const square_point1_2_geometry = new THREE.BoxGeometry(10, 10, 10);
  const square_point1_2_material = new THREE.MeshBasicMaterial({
    color: 0xff9999,
  });
  const square_point1_2_mesh = new THREE.Mesh(
    square_point1_2_geometry,
    square_point1_2_material
  );
  square_point1_2_mesh.position.set(100, 300, 0);

  const square_point1_3_geometry = new THREE.BoxGeometry(10, 10, 10);
  const square_point1_3_material = new THREE.MeshBasicMaterial({
    color: 0xff9999,
  });
  const square_point1_3_mesh = new THREE.Mesh(
    square_point1_3_geometry,
    square_point1_3_material
  );
  square_point1_3_mesh.position.set(300, 300, 0);

  const square_point1_4_geometry = new THREE.BoxGeometry(10, 10, 10);
  const square_point1_4_material = new THREE.MeshBasicMaterial({
    color: 0xff9999,
  });
  const square_point1_4_mesh = new THREE.Mesh(
    square_point1_4_geometry,
    square_point1_4_material
  );
  square_point1_4_mesh.position.set(300, 100, 0);

  // scene.add(circle_left_point_mesh);
  // scene.add(circle_right_point_mesh);
  // scene.add(circle_change_point_upper_mesh);
  // scene.add(circle_change_point_lower_mesh);

  // const left_point = [start_dot_mesh.position.x, start_dot_mesh.position.y];
  // const right_point = [end_dot_mesh.position.x, end_dot_mesh.position.y];
  // const upper_circle_change_point = [third_dot_mesh.position.x, third_dot_mesh.position.y];
  // const lower_circle_change_point = [fourth_dot_mesh.position.x, fourth_dot_mesh.position.y];
  // const circle_param = [...left_point, ...right_point, ...upper_circle_change_point, ...lower_circle_change_point];

  // console.log(circle_param);

  return [
    circle_left_point_mesh,
    circle_right_point_mesh,
    circle_change_point_upper_mesh,
    circle_change_point_lower_mesh,
    extrude_dot_mesh,
    square_point1_1_mesh,
    square_point1_2_mesh,
    square_point1_3_mesh,
    square_point1_4_mesh,
  ];
  // CircleUtils.IsLowerCircleUpward(circle_param);
  // CircleUtils.IsUpperCircleBelow(circle_param);

  // const circle = CircleUtils.makeCircle(circle_param);
}
