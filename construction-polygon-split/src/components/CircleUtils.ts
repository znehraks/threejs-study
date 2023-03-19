import * as turf from '@turf/turf';
import { Feature, LineString, Point, Position, Properties } from '@turf/turf';
import * as THREE from 'three';
import { Shape, Vector2 } from 'three';
import { v4 as uuidv4 } from 'uuid';

/**
 * * 네 점으로, 윗 반원과 아랫 반원을 만들고, 해당 arc 라인을 반환
 */
export function getCircle(args: THREE.Vector2[]) {
  const left_point = args[0];
  const right_point = args[1];
  const upper_circle_change_point = args[2];
  const lower_circle_change_point = args[3];
  /**
   * * 윗 반원
   */
  const upper_arc: ArchiLine = generateArcByThreePoints([
    left_point,
    right_point,
    upper_circle_change_point,
  ]);

  /**
   * * 아랫 반원
   */
  const lower_arc: ArchiLine = generateArcByThreePoints([
    right_point,
    left_point,
    lower_circle_change_point,
  ]);
  const res: ArchiLine[] = [];
  res.push(upper_arc);
  res.push(lower_arc);

  return res;
}

function genArc(
  start_point: Feature<Point, Properties>,
  middle_point: Feature<Point, Properties>,
  end_point: Feature<Point, Properties>
) {
  const param: Vector2[] = [];
  let arc: Position[] = [];
  param.push(
    new Vector2(
      start_point.geometry.coordinates[0],
      start_point.geometry.coordinates[1]
    )
  );
  param.push(
    new Vector2(
      end_point.geometry.coordinates[0],
      end_point.geometry.coordinates[1]
    )
  );
  param.push(
    new Vector2(
      middle_point.geometry.coordinates[0],
      middle_point.geometry.coordinates[1]
    )
  );
  // param.push(new Vector2(circle_point.geometry.coordinates[0], circle_point.geometry.coordinates[1] - radius));

  const circle = makePlaneCircle(param);

  let endFlag = false;
  let middleFlag = false;
  let startIndex = 0;
  let middleIndex;
  let endIndex;

  for (let ind = 0; ind < circle.getPoints().length; ind += 1) {
    if (
      AreTwoPointsSame(
        [circle.getPoints()[ind].x, circle.getPoints()[ind].y],
        [
          start_point.geometry.coordinates[0],
          start_point.geometry.coordinates[1],
        ]
      )
    ) {
      startIndex = ind;
    } else if (
      AreTwoPointsSame(
        [circle.getPoints()[ind].x, circle.getPoints()[ind].y],
        [
          middle_point.geometry.coordinates[0],
          middle_point.geometry.coordinates[1],
        ]
      )
    ) {
      middleIndex = ind;
    } else if (
      AreTwoPointsSame(
        [circle.getPoints()[ind].x, circle.getPoints()[ind].y],
        [end_point.geometry.coordinates[0], end_point.geometry.coordinates[1]]
      )
    ) {
      endIndex = ind;
    }
  }
  // 만약 start point , middle point, end point 를 거리 제한으로 index 를 찾지 못했다면 가장 가까운 근사점 찾아야함

  if (startIndex === undefined) {
    let minimum = 999999;
    let minimumIndex = 0;
    let distance = 0;
    for (let i = 0; i < circle.getPoints().length - 1; i += 1) {
      distance =
        (circle.getPoints()[i].x - start_point.geometry.coordinates[0]) *
          (circle.getPoints()[i].x - start_point.geometry.coordinates[0]) +
        (circle.getPoints()[i].y - start_point.geometry.coordinates[1]) *
          (circle.getPoints()[i].y - start_point.geometry.coordinates[1]);

      if (minimum > distance) {
        minimum = distance;
        minimumIndex = i;
      }
    }
    middleIndex = minimumIndex;
  }

  if (middleIndex === undefined) {
    let minimum = 999999;
    let minimumIndex = 0;
    let distance = 0;
    for (let i = 0; i < circle.getPoints().length; i += 1) {
      distance =
        (circle.getPoints()[i].x - middle_point.geometry.coordinates[0]) *
          (circle.getPoints()[i].x - middle_point.geometry.coordinates[0]) +
        (circle.getPoints()[i].y - middle_point.geometry.coordinates[1]) *
          (circle.getPoints()[i].y - middle_point.geometry.coordinates[1]);
      if (minimum > distance) {
        minimum = distance;
        minimumIndex = i;
      }
    }
    middleIndex = minimumIndex;
  }

  if (endIndex === undefined) {
    let minimum = 999999;
    let minimumIndex = 0;
    let distance = 0;
    for (let i = 0; i < circle.getPoints().length; i += 1) {
      distance =
        (circle.getPoints()[i].x - end_point.geometry.coordinates[0]) *
          (circle.getPoints()[i].x - end_point.geometry.coordinates[0]) +
        (circle.getPoints()[i].y - end_point.geometry.coordinates[1]) *
          (circle.getPoints()[i].y - end_point.geometry.coordinates[1]);
      if (minimum > distance) {
        minimum = distance;
        minimumIndex = i;
      }
    }
    endIndex = minimumIndex;
  }

  // 정방향 탐색
  for (let i = 0; i <= circle.getPoints().length; i += 1) {
    let ind = startIndex + i;
    if (ind >= circle.getPoints().length) {
      ind -= circle.getPoints().length;
    }
    if (ind === middleIndex) {
      middleFlag = true;
    } else if (ind === endIndex) {
      if (middleFlag === false) {
        arc = [];
        break;
      } else {
        endFlag = true;
        arc.push([circle.getPoints()[ind].x, circle.getPoints()[ind].y]);
        break;
      }
    }
    arc.push([circle.getPoints()[ind].x, circle.getPoints()[ind].y]);
  }
  if (endFlag !== true) {
    // 역방향 탐색
    for (let i = 0; i < circle.getPoints().length; i += 1) {
      let ind = startIndex - i;
      if (ind < 0) {
        ind += circle.getPoints().length;
      }
      // console.log('indind', ind);

      if (ind === middleIndex) {
        middleFlag = true;
      }
      if (ind === endIndex) {
        if (middleFlag === false) {
          arc.push([circle.getPoints()[ind].x, circle.getPoints()[ind].y]);

          break;
        } else {
          endFlag = true;
          arc.push([circle.getPoints()[ind].x, circle.getPoints()[ind].y]);
          break;
        }
      }
      arc.push([circle.getPoints()[ind].x, circle.getPoints()[ind].y]);
    }
  }

  const res = turf.lineString([
    start_point.geometry.coordinates,
    end_point.geometry.coordinates,
  ]);
  res.geometry.coordinates = arc;
  return res;
}
export function drawCircle(args: THREE.Shape) {
  const circle_geo = new THREE.ShapeGeometry(args);
  const circle_material = new THREE.MeshBasicMaterial({
    color: Math.round(Math.random() * 0xffffff),
    side: THREE.DoubleSide,
  });
  const circle_mesh = new THREE.Mesh(circle_geo, circle_material);

  return circle_mesh;
}
export function makePlaneCircle(args: Vector2[]): Shape {
  const left_point = args[0];
  const right_point = args[1];
  const middle_point = args[2];
  if (left_point.x > right_point.x) {
    const temp_x = right_point.x;
    const temp_y = right_point.y;
    right_point.x = left_point.x;
    right_point.y = left_point.y;
    left_point.x = temp_x;
    left_point.y = temp_y;
  }
  const circle_param = [left_point, right_point, middle_point, middle_point];

  let upper_shape = new THREE.Shape();
  let lower_shape = new THREE.Shape();

  upper_shape = draw_upper_circle(circle_param, undefined);
  lower_shape = draw_lower_circle(circle_param, undefined);

  const full_circle_shape = new THREE.Shape();

  full_circle_shape.setFromPoints(
    upper_shape.getPoints().concat(lower_shape.getPoints().reverse())
  );
  return full_circle_shape;
}

export function makeCircle(args: Vector2[]): [Shape, ArchiLine[]] {
  const left_point = args[0];
  const right_point = args[1];
  const upper_circle_change_point = args[2];
  const lower_circle_change_point = args[3];

  const circle_param = [
    left_point,
    right_point,
    upper_circle_change_point,
    lower_circle_change_point,
  ];

  let upper_shape = new THREE.Shape();
  let lower_shape = new THREE.Shape();

  if (IsLowerCircleUpward(circle_param)) {
    lower_shape = draw_upper_circle_lower_hole(circle_param, undefined);
    upper_shape = draw_upper_circle(circle_param, undefined);
  } else if (IsUpperCircleBelow(circle_param)) {
    upper_shape = draw_lower_circle_upper_hole(circle_param);
    lower_shape = draw_lower_circle(circle_param, undefined);
  } else {
    upper_shape = draw_upper_circle(circle_param, undefined);
    lower_shape = draw_lower_circle(circle_param, undefined);
  }

  const full_circle_shape = new THREE.Shape();

  full_circle_shape.setFromPoints(
    upper_shape.getPoints().concat(lower_shape.getPoints().reverse())
  );
  return [full_circle_shape, []];
}

function IsUpperCircleBelow(args: Vector2[]) {
  const left_point = args[0];
  const right_point = args[1];
  const upper_circle_change_point = args[2];

  const slope = (right_point.y - left_point.y) / (right_point.x - left_point.x);
  // const a = (y2_down - y1_down) / (x2_down - x1_down)
  const y_intercept = left_point.y - slope * left_point.x;
  // const b = y1_down - a * x1_down

  if (
    upper_circle_change_point.y <=
    slope * upper_circle_change_point.x + y_intercept
  ) {
    // if(y3_upper <= a * x3_upper + b ) {
    return true;
  }
  return false;
}

function IsLowerCircleUpward(args: Vector2[]) {
  const left_point = args[0];
  const right_point = args[1];
  const lower_circle_change_point = args[3];

  const slope = (right_point.y - left_point.y) / (right_point.x - left_point.x);
  // const a = (y2_down - y1_down) / (x2_down - x1_down)

  const y_intercept = left_point.y - slope * left_point.x;
  // const b = y1_down - a * x1_down

  if (
    lower_circle_change_point.y >=
    slope * lower_circle_change_point.x + y_intercept
  ) {
    return true;
  }
  return false;
}

// prev name : make_side_shape
export function MakeCircleSide(upper_shape: Shape, color: number) {
  const points: Vector2[] = upper_shape.getPoints();

  for (let i = points.length - 1; i > 0; i - 1) {
    points.push(points[i]);
  }

  const up_circle_shape = new THREE.Shape();
  if (points.length !== 0) {
    up_circle_shape.setFromPoints(points);
  }

  const up_circle_geo = new THREE.ShapeGeometry(up_circle_shape);
  const material_up_shape = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });
  const mesh_circle_up = new THREE.Mesh(up_circle_geo, material_up_shape);
  console.log(mesh_circle_up);
  return up_circle_shape;
}

function draw_upper_circle_lower_hole(
  args: Vector2[],
  _upper_circle_hole:
    | { getPoints: () => THREE.Vector2[] | undefined }
    | undefined
) {
  const x_left = args[0].x;
  const y_left = args[0].y;
  const x_right = args[1].x;
  const y_right = args[1].y;
  const x_change = args[3].x;
  const y_change = args[3].y;

  const [xr, yr, rr] = findCircle([
    x_left,
    y_left,
    x_right,
    y_right,
    x_change,
    y_change,
  ]);

  // 쿠홈 스펙에서 y1_upper 와 y2_upper 의 값은 동일함

  const lowerHolePoints: Vector2[] = [];

  // A(x1, y1), B(x2,y2) 원의 중점(a,b) 반지름 r
  // case 1) a-r < x1 & x2 < a+r
  // draw line a-r to a+r

  const d = rr / 100;
  // d 는 추후에 계산 변경 필요

  if (y_left > yr && y_right > yr) {
    lowerHolePoints.push(new Vector2(x_left, y_left));

    for (let x = x_left + d; x < x_right; x += d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerHolePoints.push(new Vector2(x, y));
    }
    lowerHolePoints.push(new Vector2(x_right, y_right));
  }

  // case 2) a-r < x1 , x2 < a + r
  else if (y_left < yr && y_right < yr) {
    // part 1) x1 to a-r
    for (let x = x_left; x > xr - rr; x -= d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerHolePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to a+r
    for (let x = xr - rr; x < xr + rr; x += d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerHolePoints.push(new Vector2(x, y));
    }

    // part3) a+r to x2
    for (let x = xr + rr; x > x_right; x -= d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerHolePoints.push(new Vector2(x, y));
    }

    lowerHolePoints.push(new Vector2(x_right, y_right));
  }

  // case 3) a-r < x1, x2 < a+r
  else if (y_left < yr && y_right > yr) {
    // console.log('case3');
    lowerHolePoints.push(new Vector2(x_left, y_left));

    // part 1) x1 to a-r
    for (let x = x_left - d; x > xr - rr; x -= d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerHolePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to x2
    for (let x = xr - rr; x < x_right; x += d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerHolePoints.push(new Vector2(x, y));
    }

    lowerHolePoints.push(new Vector2(x_right, y_right));
  }

  // case 4)  a-r > x1, x2 < a+r
  else if (y_left > yr && y_right < yr) {
    // console.log('case4');

    // part 1) x1 to a+r
    for (let x = x_left; x < xr + rr; x += d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerHolePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to x2
    for (let x = xr + rr; x > x_right; x -= d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerHolePoints.push(new Vector2(x, y));
    }

    lowerHolePoints.push(new Vector2(x_right, y_right));
  }
  const upper_circle_hole = new THREE.Shape();
  if (lowerHolePoints.length !== 0) {
    upper_circle_hole.setFromPoints(lowerHolePoints);
  }
  // upper_circle_hole.closePath();

  return upper_circle_hole;
}
function findCircle(args: number[]) {
  const x1 = args[0];
  const y1 = args[1];

  const x2 = args[2];
  const y2 = args[3];

  const x3 = args[4];
  const y3 = args[5];

  const x12 = x1 - x2;
  const x13 = x1 - x3;

  const y12 = y1 - y2;
  const y13 = y1 - y3;

  const y31 = y3 - y1;
  const y21 = y2 - y1;

  const x31 = x3 - x1;
  const x21 = x2 - x1;

  // x1^2 - x3^2
  const sx13 = x1 ** 2 - x3 ** 2;

  // y1^2 - y3^2
  const sy13 = y1 ** 2 - y3 ** 2;

  const sx21 = x2 ** 2 - x1 ** 2;
  const sy21 = y2 ** 2 - y1 ** 2;

  const f =
    (sx13 * x12 + sy13 * x12 + sx21 * x13 + sy21 * x13) /
    (2 * (y31 * x12 - y21 * x13));
  const g =
    (sx13 * y12 + sy13 * y12 + sx21 * y13 + sy21 * y13) /
    (2 * (x31 * y12 - x21 * y13));

  const c = -(x1 ** 2) - y1 ** 2 - 2 * g * x1 - 2 * f * y1;

  // eqn of circle be
  // x^2 + y^2 + 2*g*x + 2*f*y + c = 0
  // where centre is (h = -g, k = -f) and radius r
  // as r^2 = h^2 + k^2 - c
  const h = -g;
  const k = -f;
  const sqr_of_r = h * h + k * k - c;

  // r is the radius
  const r = Math.sqrt(sqr_of_r);

  const xr = h;
  const yr = k;
  const rr = Number(r.toFixed(5));

  return [xr, yr, rr];
}

function draw_upper_circle(
  args: Vector2[],
  _upper_circle_hole:
    | { getPoints: () => THREE.Vector2[] | undefined }
    | undefined
) {
  const x_left = args[0].x;
  const y_left = args[0].y;
  const x_right = args[1].x;
  const y_right = args[1].y;
  const x_change = args[2].x;
  const y_change = args[2].y;

  const [xr, yr, rr] = findCircle([
    x_left,
    y_left,
    x_right,
    y_right,
    x_change,
    y_change,
  ]);

  const upperCirclePoints: Vector2[] = [];

  // A(x1, y1), B(x2,y2) 원의 중점(a,b) 반지름 r
  // case 1) a-r < x1 & x2 < a+r
  // draw line a-r to a+r

  const d = rr / 100;
  // d 는 추후에 계산 변경 필요

  if (y_left >= yr && y_right >= yr) {
    // console.log('case1');

    upperCirclePoints.push(new Vector2(x_left, y_left));

    for (let x = x_left + d; x < x_right; x += d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperCirclePoints.push(new Vector2(x, y));
    }
    upperCirclePoints.push(new Vector2(x_right, y_right));
  }

  // case 2) a-r < x1 , x2 < a + r
  else if (y_left <= yr && y_right <= yr) {
    // part 1) x1 to a-r
    for (let x = x_left; x > xr - rr; x -= d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperCirclePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to a+r
    for (let x = xr - rr; x < xr + rr; x += d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperCirclePoints.push(new Vector2(x, y));
    }

    // part3) a+r to x2
    for (let x = xr + rr; x > x_right; x -= d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperCirclePoints.push(new Vector2(x, y));
    }

    upperCirclePoints.push(new Vector2(x_right, y_right));
  }

  // case 3) a-r < x1, x2 < a+r
  else if (y_left <= yr && y_right >= yr) {
    // console.log('case3');

    // part 1) x1 to a-r
    for (let x = x_left; x > xr - rr; x -= d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperCirclePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to x2
    for (let x = xr - rr; x < x_right; x += d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperCirclePoints.push(new Vector2(x, y));
    }

    upperCirclePoints.push(new Vector2(x_right, y_right));
    // upperCirclePoints.push(new Vector2(x1_upper, y1_upper))
  }

  // case 4)  a-r > x1, x2 < a+r
  else if (y_left >= yr && y_right <= yr) {
    // console.log('case4');

    // part 1) x1 to a+r
    for (let x = x_left; x < xr + rr; x += d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperCirclePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to x2
    for (let x = xr + rr; x > x_right; x -= d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperCirclePoints.push(new Vector2(x, y));
    }

    upperCirclePoints.push(new Vector2(x_right, y_right));
  }

  const circle_upper = new THREE.Shape();
  if (upperCirclePoints.length !== 0) {
    for (let i = 1; i < upperCirclePoints.length; i += 1) {
      if (
        Number.isNaN(upperCirclePoints[i].x) ||
        Number.isNaN(upperCirclePoints[i].y)
      ) {
        upperCirclePoints[i].x = upperCirclePoints[i - 1].x;
        upperCirclePoints[i].y = upperCirclePoints[i - 1].y;
      }
    }

    circle_upper.setFromPoints(upperCirclePoints);
  }
  // circle_upper.closePath();

  // if(upper_circle_hole != undefined) {
  //     var path = new THREE.Path(upper_circle_hole.getPoints())
  //     circle_upper.holes.push(path);
  //
  // }

  // const circle_upper_geo = new THREE.ShapeGeometry(circle_upper);
  // const material_upper_shape = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  // const mesh_circle_upper = new THREE.Mesh(circle_upper_geo, material_upper_shape);
  // mesh_circle_upper.position.set(0, 0, 0);
  // scene.add(mesh_circle_upper);

  return circle_upper;
}

function draw_lower_circle_upper_hole(args: Vector2[]) {
  const lower_circle_upper_hole = new THREE.Shape();
  const upperHolePoints: Vector2[] = [];

  const x_left = args[0].x;
  const y_left = args[0].y;
  const x_right = args[1].x;
  const y_right = args[1].y;
  const x_change = args[2].x;
  const y_change = args[2].y;

  const [xr, yr, rr] = findCircle([
    x_left,
    y_left,
    x_right,
    y_right,
    x_change,
    y_change,
  ]);

  // 쿠홈 스펙에서 y1_upper 와 y2_upper 의 값은 동일함

  // A(x1, y1), B(x2,y2) 원의 중점(a,b) 반지름 r
  // case 1) a-r < x1 & x2 < a+r
  // draw line a-r to a+r

  const d = rr / 100;
  // d 는 추후에 계산 변경 필요

  if (y_left > yr && y_right > yr) {
    upperHolePoints.push(new Vector2(x_left, y_left));

    for (let x = x_left - d; x > xr - rr; x -= d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperHolePoints.push(new Vector2(x, y));
    }
    for (let x = xr - rr; x < xr + rr; x += d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperHolePoints.push(new Vector2(x, y));
    }
    for (let x = xr + rr; x > x_right; x -= d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperHolePoints.push(new Vector2(x, y));
    }
    upperHolePoints.push(new Vector2(x_right, y_right));
  }

  // case 2) y1, y2 < yr
  else if (y_left < yr && y_right < yr) {
    // console.log('Down hole case2');

    upperHolePoints.push(new Vector2(x_left, y_left));

    // part 1) x1 to a-r
    for (let x = x_left + d; x < x_right; x += d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperHolePoints.push(new Vector2(x, y));
    }
    upperHolePoints.push(new Vector2(x_right, y_right));
  }

  // case 3) y1 < yr , y2 > yr
  else if (y_left < yr && y_right > yr) {
    upperHolePoints.push(new Vector2(x_left, y_left));
    // part 1) x1 to a-r
    for (let x = x_left + d; x < xr + rr; x += d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperHolePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to x2
    for (let x = xr + rr; x > x_right; x -= d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperHolePoints.push(new Vector2(x, y));
    }
    upperHolePoints.push(new Vector2(x_right, y_right));
  }

  // case 4)  a-r > x1, x2 < a+rㅇ
  else if (y_left > yr && y_right < yr) {
    upperHolePoints.push(new Vector2(x_left, y_left));
    // part 1) x1 to a+r
    for (let x = x_left - d; x > xr - rr; x -= d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperHolePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to x2
    for (let x = xr - rr; x < x_right; x += d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      upperHolePoints.push(new Vector2(x, y));
    }

    upperHolePoints.push(new Vector2(x_right, y_right));
  }

  // upperHolePoints.push(new Vector2(x1_upper, y1_upper))

  if (upperHolePoints.length !== 0) {
    for (let i = 1; i < upperHolePoints.length; i += 1) {
      if (
        Number.isNaN(upperHolePoints[i].x) ||
        Number.isNaN(upperHolePoints[i].y)
      ) {
        upperHolePoints[i].x = upperHolePoints[i - 1].x;
        upperHolePoints[i].y = upperHolePoints[i - 1].y;
      }
    }
    lower_circle_upper_hole.setFromPoints(upperHolePoints);
  }

  // down_circle_hole.closePath();

  return lower_circle_upper_hole;
}

function draw_lower_circle(
  args: Vector2[],
  _down_circle_hole:
    | { getPoints: () => THREE.Vector2[] | undefined }
    | undefined
) {
  const x_left = args[0].x;
  const y_left = args[0].y;
  const x_right = args[1].x;
  const y_right = args[1].y;
  const x_change = args[3].x;
  const y_change = args[3].y;

  const [xr, yr, rr] = findCircle([
    x_left,
    y_left,
    x_right,
    y_right,
    x_change,
    y_change,
  ]);

  // 쿠홈 스펙에서 y1_upper 와 y2_upper 의 값은 동일함

  const lowerCirclePoints: Vector2[] = [];

  // A(x1, y1), B(x2,y2) 원의 중점(a,b) 반지름 r
  // case 1) a-r < x1 & x2 < a+r
  // draw line a-r to a+r

  const d = rr / 100;
  // d 는 추후에 계산 변경 필요

  if (y_left >= yr && y_right >= yr) {
    lowerCirclePoints.push(new Vector2(x_left, y_left));

    for (let x = x_left - d; x > xr - rr; x -= d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerCirclePoints.push(new Vector2(x, y));
    }
    for (let x = xr - rr; x < xr + rr; x += d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerCirclePoints.push(new Vector2(x, y));
    }
    for (let x = xr + rr; x > x_right; x -= d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerCirclePoints.push(new Vector2(x, y));
    }
    lowerCirclePoints.push(new Vector2(x_right, y_right));
  }

  // case 2) y1, y2 < yr
  else if (y_left <= yr && y_right <= yr) {
    lowerCirclePoints.push(new Vector2(x_left, y_left));

    // part 1) x1 to a-r
    for (let x = x_left + d; x < x_right; x += d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerCirclePoints.push(new Vector2(x, y));
    }
    lowerCirclePoints.push(new Vector2(x_right, y_right));
  }

  // case 3) y1 < yr , y2 > yr
  else if (y_left <= yr && y_right >= yr) {
    lowerCirclePoints.push(new Vector2(x_left, y_left));
    // part 1) x1 to a-r
    for (let x = x_left + d; x < xr + rr; x += d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerCirclePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to x2
    for (let x = xr + rr; x > x_right; x -= d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerCirclePoints.push(new Vector2(x, y));
    }
    lowerCirclePoints.push(new Vector2(x_right, y_right));
  }

  // case 4)  a-r > x1, x2 < a+r
  else if (y_left >= yr && y_right <= yr) {
    // console.log('DOWN CIRCLE case4');

    lowerCirclePoints.push(new Vector2(x_left, y_left));
    // part 1) x1 to a+r
    for (let x = x_left - d; x > xr - rr; x -= d) {
      const y = Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerCirclePoints.push(new Vector2(x, y));
    }

    // part 2) a-r to x2
    for (let x = xr - rr; x < x_right; x += d) {
      const y = -Math.sqrt(rr ** 2 - (x - xr) ** 2) + yr;
      lowerCirclePoints.push(new Vector2(x, y));
    }

    lowerCirclePoints.push(new Vector2(x_right, y_right));
  }
  // var holePath = new THREE.Path(upperHolePoints);
  const circle_down = new THREE.Shape();
  if (lowerCirclePoints.length !== 0) {
    for (let i = 1; i < lowerCirclePoints.length; i += 1) {
      if (
        Number.isNaN(lowerCirclePoints[i].x) ||
        Number.isNaN(lowerCirclePoints[i].y)
      ) {
        lowerCirclePoints[i].x = lowerCirclePoints[i - 1].x;
        lowerCirclePoints[i].y = lowerCirclePoints[i - 1].y;
      }
    }
    circle_down.setFromPoints(lowerCirclePoints);
  }

  return circle_down;
}

/**
 * * 세 점으로 arc 만드는 함수
 */
export function generateArcByThreePoints(args: Vector2[]): ArchiLine {
  const x_left = args[0].x;
  const y_left = args[0].y;
  const x_right = args[1].x;
  const y_right = args[1].y;
  const x_middle = args[2].x;
  const y_middle = args[2].y;

  const reverseFlag = false;

  const [xr_arc, yr_arc, rr_arc] = findCircle([
    x_left,
    y_left,
    x_right,
    y_right,
    x_middle,
    y_middle,
  ]);

  const start_point = turf.point([x_left, y_left]);
  const end_point = turf.point([x_right, y_right]);
  const middle_point = turf.point([x_middle, y_middle]);
  const generatedArc = genArc(start_point, middle_point, end_point);

  const start_archi_point: ArchiPoint = {
    archiId: undefined,
    position_x: x_left,
    position_y: y_left,
    position_z: undefined,
  };
  const end_archi_point: ArchiPoint = {
    archiId: undefined,
    position_x: x_right,
    position_y: y_right,
    position_z: undefined,
  };

  if (reverseFlag) {
    start_archi_point.position_x = x_right;
    start_archi_point.position_y = y_right;

    end_archi_point.position_x = x_left;
    end_archi_point.position_y = y_left;
  }
  const generated_arc: ArchiLine = {
    line: generatedArc,
    type: 'arc',
    cx: xr_arc,
    cy: yr_arc,
    cr: rr_arc,
    start_point: start_archi_point,
    end_point: end_archi_point,
  };

  return generated_arc;
}

type LineType = 'arc' | 'linear';
export interface ArchiLine {
  // line: Feature<LineString> | LineString;
  line: Feature<LineString>;
  type: LineType;
  cx: number | undefined;
  cy: number | undefined;
  cr: number | undefined;
  start_point: ArchiPoint;
  end_point: ArchiPoint;
  // start_x: number | undefined;
  // start_y: number | undefined;
  // end_x: number | undefined;
  // end_y: number | undefined;
}
export interface ArchiPoint {
  archiId: string | undefined;
  position_x: number;
  position_y: number;
  position_z: number | undefined;
}

export class ArchiPointImpl implements ArchiPoint {
  archiId: string | undefined;

  position_x: number;

  position_y: number;

  position_z: number | undefined;

  constructor(
    archiId: string | undefined,
    position_x: number,
    position_y: number
  ) {
    if (archiId === undefined) {
      this.archiId = uuidv4();
    } else {
      this.archiId = archiId;
    }

    this.position_x = position_x;
    this.position_y = position_y;
    this.position_z = undefined;
  }
}

function AreTwoPointsSame(point1: number[], point2: number[]) {
  const distance = Math.sqrt(
    (point1[0] - point2[0]) * (point1[0] - point2[0]) +
      (point1[1] - point2[1]) * (point1[1] - point2[1])
  );

  if (distance < 0.5) {
    return true;
  }
  return false;
}

export const isTwoDimensionalArchiLine = (
  t: ArchiLine[] | ArchiLine[][]
): t is ArchiLine[][] => {
  return Array.isArray(t[0]);
};
