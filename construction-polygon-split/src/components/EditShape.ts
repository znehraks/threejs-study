import * as turf from '@turf/turf';
import * as lodash from 'lodash';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

import {
  ArchiLine,
  ArchiPoint,
  ArchiPointImpl,
  generateArcByThreePoints,
  isTwoDimensionalArchiLine,
} from './CircleUtils';

export function getInteractionBetweenShape(
  lines1: ArchiLine[],
  lines2: ArchiLine[]
): ArchiLine[][] {
  const poly1 = archiLineToPolygon(lines1);
  const poly2 = archiLineToPolygon(lines2);
  const staticPoints1: ArchiPoint[] = [];

  // 도형 1의 고정점 확인
  for (const ln of lines1) {
    if (ln.type === 'linear' || ln.type === 'arc') {
      if (
        !isItemInArray(staticPoints1, [
          ln.start_point.position_x,
          ln.start_point.position_y,
        ])
      ) {
        const newPoint = new ArchiPointImpl(
          ln.start_point.archiId,
          ln.start_point.position_x,
          ln.start_point.position_y
        );
        staticPoints1.push(newPoint);
      }
      if (
        !isItemInArray(staticPoints1, [
          ln.end_point.position_x,
          ln.end_point.position_y,
        ])
      ) {
        const newPoint = new ArchiPointImpl(
          ln.end_point.archiId,
          ln.end_point.position_x,
          ln.end_point.position_y
        );
        staticPoints1.push(newPoint);
      }
    }
  }

  // 도형 2의 고정점 확인
  const staticPoints2 = [];
  for (const ln of lines2) {
    if (ln.type === 'linear' || ln.type === 'arc') {
      if (
        !isItemInArray(staticPoints2, [
          ln.start_point.position_x,
          ln.start_point.position_y,
          ln.start_point.archiId,
        ])
      ) {
        const newPoint = new ArchiPointImpl(
          ln.start_point.archiId,
          ln.start_point.position_x,
          ln.start_point.position_y
        );
        staticPoints2.push(newPoint);
      }
      if (
        !isItemInArray(staticPoints2, [
          ln.end_point.position_x,
          ln.end_point.position_y,
        ])
      ) {
        const newPoint = new ArchiPointImpl(
          ln.end_point.archiId,
          ln.end_point.position_x,
          ln.end_point.position_y
        );
        staticPoints2.push(newPoint);
      }
    }
  }

  // 두 도형을 line 으로 분해해서 intersect points 들을 찾기
  const intersectPoints = findIntersectPoints(lines1, lines2);

  // intersect (A * B)
  const int = intersect(
    poly1,
    poly2,
    staticPoints1,
    staticPoints2,
    intersectPoints
  );
  // difference (A - B)
  const diffA = difference(
    poly1,
    poly2,
    staticPoints1,
    staticPoints2,
    intersectPoints
  );
  // difference (B - A)
  const diffB = difference(
    poly2,
    poly1,
    staticPoints1,
    staticPoints2,
    intersectPoints
  );

  const res: ArchiLine[][] = [];

  if (diffA.length !== 0 && isTwoDimensionalArchiLine(diffA)) {
    for (const i of diffA) {
      res.push(i);
    }
  }

  if (diffB.length !== 0 && isTwoDimensionalArchiLine(diffB)) {
    for (const i of diffB) {
      res.push(i);
    }
  }

  if (int.length !== 0 && isTwoDimensionalArchiLine(int)) {
    for (const i of int) {
      res.push(i);
    }
  }

  return res;
}

function intersect(
  shape1:
    | turf.helpers.Polygon
    | turf.helpers.MultiPolygon
    | turf.helpers.Feature<
        turf.helpers.Polygon | turf.helpers.MultiPolygon,
        turf.helpers.Properties
      >,
  shape2:
    | turf.helpers.Polygon
    | turf.helpers.MultiPolygon
    | turf.helpers.Feature<
        turf.helpers.Polygon | turf.helpers.MultiPolygon,
        turf.helpers.Properties
      >,
  // staticPoints1: (string | number | undefined)[][],
  // staticPoints2: (string | number | undefined)[][],
  staticPoints1: ArchiPoint[],
  staticPoints2: ArchiPoint[],
  intersectPoints: ArchiPoint[]
  // intersectPoints: turf.helpers.Position[]
): ArchiLine[][] {
  // const intersect_shape_lines: ArchiLine[] = [];
  const res: ArchiLine[][] = [];
  const traversePoints: THREE.Vector2[] = [];
  const intersection = turf.intersect(shape1, shape2);
  if (intersection != null) {
    if (intersection.geometry.type === 'Polygon') {
      // intersectPoints.push(intersection.geometry.coordinates[0][0]);

      for (let i = 0; i < intersection.geometry.coordinates[0].length; i += 1) {
        const x = intersection.geometry.coordinates[0][i][0];
        const y = intersection.geometry.coordinates[0][i][1];
        traversePoints.push(new THREE.Vector2(x, y));
      }
    }
  }
  res.push(
    makeArchiLines(
      staticPoints1,
      staticPoints2,
      intersectPoints,
      traversePoints
    )
  );
  return res;
}

function difference(
  poly1:
    | turf.helpers.Polygon
    | turf.helpers.MultiPolygon
    | turf.helpers.Feature<
        turf.helpers.Polygon | turf.helpers.MultiPolygon,
        turf.helpers.Properties
      >,
  poly2:
    | turf.helpers.Polygon
    | turf.helpers.MultiPolygon
    | turf.helpers.Feature<
        turf.helpers.Polygon | turf.helpers.MultiPolygon,
        turf.helpers.Properties
      >,
  staticPoints1: ArchiPoint[],
  staticPoints2: ArchiPoint[],
  // intersectPoints: turf.helpers.Position[]
  intersectPoints: ArchiPoint[]
): ArchiLine[][] {
  const turf_diff = turf.difference(poly1, poly2);

  const res: ArchiLine[][] = [];
  // const res2: ArchiLine[][] = [];
  if (turf_diff != null) {
    if (turf_diff.geometry.type === 'Polygon') {
      const traversePoints: THREE.Vector2[] = [];
      for (let i = 0; i < turf_diff.geometry.coordinates[0].length; i += 1) {
        const x = turf_diff.geometry.coordinates[0][i][0];
        const y = turf_diff.geometry.coordinates[0][i][1];
        traversePoints.push(new THREE.Vector2(x, y));
      }

      res.push(
        makeArchiLines(
          staticPoints1,
          staticPoints2,
          intersectPoints,
          traversePoints
        )
      );
    }
    if (turf_diff.geometry.type === 'MultiPolygon') {
      for (let i = 0; i < turf_diff.geometry.coordinates.length; i += 1) {
        const traversePoints: THREE.Vector2[] = [];
        // intersectPoints.push(turf_diff.geometry.coordinates[i][0][0]);

        for (
          let j = 0;
          j < turf_diff.geometry.coordinates[i][0].length;
          j += 1
        ) {
          const x = turf_diff.geometry.coordinates[i][0][j][0];
          const y = turf_diff.geometry.coordinates[i][0][j][1];
          traversePoints.push(new THREE.Vector2(x, y));
        }
        res.push(
          makeArchiLines(
            staticPoints1,
            staticPoints2,
            intersectPoints,
            traversePoints
          )
        );
      }
      return res;
    }
  }
  return res;
}

// shape1_points
function findIntersectPoints(
  shape1_lines: ArchiLine[],
  shape2_lines: ArchiLine[]
) {
  const intersect_points = [];
  for (const line1 of shape1_lines) {
    for (const line2 of shape2_lines) {
      const intersectPoints = turf.lineIntersect(line1.line, line2.line);
      if (intersectPoints.features.length !== 0) {
        for (const int of intersectPoints.features) {
          const new_point: ArchiPoint = {
            archiId: undefined,
            position_x: 0,
            position_y: 0,
            position_z: undefined,
          };
          // TO DO 기존의 점들 (static point1 과 2랑 동일한 점인지 판단해서 archi ID 를 부여하는 작업 필요해보임)
          if (
            AreTwoPointsSame(int.geometry.coordinates, [
              line1.start_point.position_x,
              line1.start_point.position_y,
            ])
          ) {
            new_point.archiId = line1.start_point.archiId;
            new_point.position_x = line1.start_point.position_x;
            new_point.position_y = line1.start_point.position_y;
          } else if (
            AreTwoPointsSame(int.geometry.coordinates, [
              line1.end_point.position_x,
              line1.end_point.position_y,
            ])
          ) {
            new_point.archiId = line1.end_point.archiId;
            new_point.position_x = line1.end_point.position_x;
            new_point.position_y = line1.end_point.position_y;
          } else if (
            AreTwoPointsSame(int.geometry.coordinates, [
              line2.start_point.position_x,
              line2.start_point.position_y,
            ])
          ) {
            new_point.archiId = line1.start_point.archiId;
            new_point.position_x = line1.start_point.position_x;
            new_point.position_y = line1.start_point.position_y;
          } else if (
            AreTwoPointsSame(int.geometry.coordinates, [
              line2.end_point.position_x,
              line2.end_point.position_y,
            ])
          ) {
            new_point.archiId = line1.end_point.archiId;
            new_point.position_x = line1.end_point.position_x;
            new_point.position_y = line1.end_point.position_y;
          } else {
            new_point.archiId = uuidv4();
            const [coord_x, coord_y] = int.geometry.coordinates;
            new_point.position_x = coord_x;
            new_point.position_y = coord_y;
          }
          intersect_points.push(new_point);
        }
      }
    }
  }
  return intersect_points;
}

function isItemInArray(array: ArchiPoint[], item: any[]) {
  for (let i = 0; i < array.length; i += 1) {
    // This if statement depends on the format of your array
    if (
      AreTwoPointsSame(
        [array[i].position_x, array[i].position_y],
        [item[0], item[1]]
      )
    ) {
      // if (lodash.isEqual(array[i], item)) {
      return true;
    }
  }

  return false; // Not found
}

function getItemInArray(
  array: ArchiPoint[],
  item: any[]
): ArchiPoint | undefined {
  for (let i = 0; i < array.length; i += 1) {
    // This if statement depends on the format of your array
    if (
      AreTwoPointsSame(
        [array[i].position_x, array[i].position_y],
        [item[0], item[1]]
      )
    ) {
      // if (lodash.isEqual(array[i], item)) {
      const res: ArchiPoint = {
        archiId: item[2],
        position_x: item[0],
        position_y: item[1],
        position_z: undefined,
      };
      return res;
      // return [array[i][0], array[i][1], array[i][2]];
    }
  }

  return undefined; // Not found
}

function makeArchiLines(
  staticPoints1: ArchiPoint[],
  staticPoints2: ArchiPoint[],
  intersectPoints: ArchiPoint[],
  // intersectPoints: turf.helpers.Position[],
  traversePoints: THREE.Vector2[]
): ArchiLine[] {
  let start_point = [];
  const resultLines: ArchiLine[] = [];
  let middle_point = [];
  let point_gap_counter: number = -1;
  let select_flag: boolean = false;
  let new_point_flag: boolean = false;
  let item: ArchiPoint | undefined;
  let item2: ArchiPoint | undefined;
  let start_archi_Id: string | undefined;
  let end_archi_Id: string | undefined;

  // 동일한 점을 인식하지 않도록 HashCheck 처럼 사용
  const temp: ArchiPoint[] = [];

  for (let i = 0; i < traversePoints.length; i += 1) {
    const point = traversePoints[i];

    if (
      isItemInArray(staticPoints1, [point.x, point.y]) ||
      isItemInArray(staticPoints2, [point.x, point.y]) ||
      isItemInArray(intersectPoints, [point.x, point.y]) ||
      i === 0 ||
      i === traversePoints.length - 1
    ) {
      if (isItemInArray(staticPoints1, [point.x, point.y])) {
        // staticPoint1 과 staticPoint2 로부터 기인한 점이면 archi Id 를 물려받을 수 있다.
        new_point_flag = false;
        item = getItemInArray(staticPoints1, [point.x, point.y]);
        if (item !== undefined) {
          item2 = temp.pop();
          if (
            item2 !== undefined &&
            item?.position_x === item2.position_x &&
            item.position_y === item2.position_y
          ) {
            temp.push(item);
            // eslint-disable-next-line no-continue
            continue;
          } else {
            temp.push(item);
          }
        }
      } else if (isItemInArray(staticPoints2, [point.x, point.y])) {
        new_point_flag = false;
        item = getItemInArray(staticPoints2, [point.x, point.y]);

        if (item !== undefined) {
          item2 = temp.pop();
          if (
            item2 !== undefined &&
            item.position_x === item2.position_x &&
            item.position_y === item2.position_y
          ) {
            temp.push(item);
            // eslint-disable-next-line no-continue
            continue;
          } else {
            temp.push(item);
          }
        }
      } else if (isItemInArray(intersectPoints, [point.x, point.y])) {
        new_point_flag = true;
        item = getItemInArray(intersectPoints, [point.x, point.y]);

        if (item !== undefined) {
          item2 = temp.pop();
          if (
            item2 !== undefined &&
            item.position_x === item2.position_x &&
            item.position_y === item2.position_y
          ) {
            temp.push(item);
            // eslint-disable-next-line no-continue
            continue;
          } else {
            temp.push(item);
          }
        }
      }
      if (start_point.length === 0 || i === 0) {
        start_point.push([point.x, point.y]);
        point_gap_counter = 0;
        select_flag = true;

        if (new_point_flag === false) {
          start_archi_Id = item?.archiId;
        } else {
          start_archi_Id = uuidv4();
        }

        // 두 점을 찾았음 = 선 완성
      } else if (start_point.length === 1) {
        if (new_point_flag === false) {
          end_archi_Id = item?.archiId;
        } else {
          end_archi_Id = uuidv4();
        }
        const line_start_point = new ArchiPointImpl(
          start_archi_Id,
          start_point[0][0],
          start_point[0][1]
        );
        const line_end_point = new ArchiPointImpl(
          end_archi_Id,
          point.x,
          point.y
        );
        // 직선일 경우
        if (point_gap_counter === 1) {
          resultLines.push({
            line: turf.lineString([
              [start_point[0][0], start_point[0][1]],
              [point.x, point.y],
            ]),
            type: 'linear',
            cx: undefined,
            cy: undefined,
            cr: undefined,
            start_point: line_start_point,
            end_point: line_end_point,
          });

          start_point = [];
          middle_point = [];
          start_point.push([point.x, point.y]);
          select_flag = true;
          point_gap_counter = 0;
          // 아크일 경우
        } else {
          const arcPoints = [];
          arcPoints.push(
            new THREE.Vector2(start_point[0][0], start_point[0][1])
          );
          arcPoints.push(new THREE.Vector2(point.x, point.y));
          arcPoints.push(
            new THREE.Vector2(
              middle_point[Math.floor(middle_point.length / 2)][0],
              middle_point[Math.floor(middle_point.length / 2)][1]
            )
          );
          const arc = generateArcByThreePoints(arcPoints);
          arc.start_point = line_start_point;
          arc.end_point = line_end_point;
          resultLines.push(arc);

          // 끝점 찍고 다시 초기화
          start_point = [];
          middle_point = [];
          start_point.push([point.x, point.y]);
          select_flag = true;
          point_gap_counter = 0;
        }
      }
    }

    if (point_gap_counter !== 0 && select_flag === false) {
      middle_point.push([point.x, point.y]);
    }
    select_flag = false;
    point_gap_counter += 1;
  }
  return resultLines;
}

function archiLineToPolygon(
  lines: ArchiLine[]
):
  | turf.helpers.Polygon
  | turf.helpers.MultiPolygon
  | turf.helpers.Feature<
      turf.helpers.Polygon | turf.helpers.MultiPolygon,
      turf.helpers.Properties
    > {
  let lineArray: any[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const temp = lines[i].line.geometry.coordinates;
    lineArray = lineArray.concat(temp);
    // lineArray.push(lines[i].line.geometry.coordinates);
  }
  const res = turf.polygon([lineArray]);

  // multi polygon 은 고려되지않음
  const { length } = res.geometry.coordinates[0];
  const before = res.geometry.coordinates[0];

  for (let i = 0; i < length - 2; i += 1) {
    if (
      before[i][0] === before[i + 1][0] &&
      before[i][1] === before[i + 1][1]
    ) {
      delete res.geometry.coordinates[0][i];
    }
  }

  res.geometry.coordinates[0] = res.geometry.coordinates[0].filter(function (
    data
  ) {
    return data !== undefined;
  });

  return res;
}

/**
 * * 라인을 바탕으로 해당 원을 mesh로 만든다.
 */
export function archiLineToMesh(lines: ArchiLine[]): THREE.Mesh {
  let lineArray: any[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const temp = lines[i].line.geometry.coordinates;
    for (const iter of temp) {
      lineArray.push(new THREE.Vector2(iter[0], iter[1]));
    }
  }
  for (let i = 0; i < lineArray.length; i += 1) {
    if (lineArray[i] === lineArray[i + 1]) {
      lineArray = lineArray.splice(i, 1);
    }
  }

  const lineToMeshShape = new THREE.Shape();
  lineToMeshShape.setFromPoints(lineArray);

  const geo = new THREE.ShapeGeometry(lineToMeshShape);
  const material = new THREE.MeshBasicMaterial({
    color: Math.round(Math.random() * 0xffffff),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, material);

  return mesh;
}

function AreTwoPointsSame(point1: number[], point2: number[]) {
  if (lodash.isEqual(point1, point2)) {
    return true;
  }
  const distance = Math.sqrt(
    (point1[0] - point2[0]) * (point1[0] - point2[0]) +
      (point1[1] - point2[1]) * (point1[1] - point2[1])
  );

  if (distance < 1) {
    return true;
  }
  return false;
}
