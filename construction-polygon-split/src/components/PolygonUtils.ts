import * as turf from '@turf/turf';
import * as THREE from 'three';
import { Vector2 } from 'three';

import { ArchiLine, ArchiPoint } from './CircleUtils';

export function makeSquare(args: Vector2[]) {
	const square_point_1 = args[0];
	const square_point_2 = args[1];
	const square_point_3 = args[2];
	const square_point_4 = args[3];

	// const square_param = [square_point_1, square_point_2, square_point_3, square_point_4];

	const sqaure_shape = new THREE.Shape();
	sqaure_shape.moveTo(square_point_1.x, square_point_1.y);
	sqaure_shape.lineTo(square_point_2.x, square_point_2.y);
	sqaure_shape.lineTo(square_point_3.x, square_point_3.y);
	sqaure_shape.lineTo(square_point_4.x, square_point_4.y);

	return sqaure_shape;
}

export function drawSquare(args: THREE.Shape) {
	const square_geometry = new THREE.ShapeGeometry(args);
	const square_material = new THREE.MeshBasicMaterial({
		color: Math.round(Math.random() * 0xffffff),
		side: THREE.DoubleSide,
	});
	const square_mesh = new THREE.Mesh(square_geometry, square_material);

	return square_mesh;
}

export function makeSqaureLine(args: Vector2[]): ArchiLine[] {
	const square_point_1 = args[0];
	const square_point_2 = args[1];
	const square_point_3 = args[2];
	const square_point_4 = args[3];

	const archiLines: ArchiLine[] = [];

	const archiPoint1: ArchiPoint = {
		archiId: 'archi_square_point1',
		position_x: square_point_1.x,
		position_y: square_point_1.y,
		position_z: undefined,
	};
	const archiPoint2: ArchiPoint = {
		archiId: 'archi_square_point2',
		position_x: square_point_2.x,
		position_y: square_point_2.y,
		position_z: undefined,
	};
	const archiPoint3: ArchiPoint = {
		archiId: 'archi_square_point3',
		position_x: square_point_3.x,
		position_y: square_point_3.y,
		position_z: undefined,
	};
	const archiPoint4: ArchiPoint = {
		archiId: 'archi_square_point4',
		position_x: square_point_4.x,
		position_y: square_point_4.y,
		position_z: undefined,
	};

	const line1: ArchiLine = {
		line: turf.lineString([
			[square_point_1.x, square_point_1.y],
			[square_point_2.x, square_point_2.y],
		]),
		type: 'linear',
		cx: undefined,
		cy: undefined,
		cr: undefined,
		start_point: archiPoint1,
		end_point: archiPoint2,
	};

	const line2: ArchiLine = {
		line: turf.lineString([
			[square_point_2.x, square_point_2.y],
			[square_point_3.x, square_point_3.y],
		]),
		type: 'linear',
		cx: undefined,
		cy: undefined,
		cr: undefined,
		start_point: archiPoint2,
		end_point: archiPoint3,
	};

	const line3: ArchiLine = {
		line: turf.lineString([
			[square_point_3.x, square_point_3.y],
			[square_point_4.x, square_point_4.y],
		]),
		type: 'linear',
		cx: undefined,
		cy: undefined,
		cr: undefined,
		start_point: archiPoint3,
		end_point: archiPoint4,
	};

	const line4: ArchiLine = {
		line: turf.lineString([
			[square_point_4.x, square_point_4.y],

			[square_point_1.x, square_point_1.y],
		]),
		type: 'linear',
		cx: undefined,
		cy: undefined,
		cr: undefined,
		start_point: archiPoint4,
		end_point: archiPoint1,
	};

	archiLines.push(line1);
	archiLines.push(line2);
	archiLines.push(line3);
	archiLines.push(line4);

	return archiLines;
}
