import React, { useLayoutEffect, useRef } from 'react';
import {
  BufferGeometry,
  LineSegments,
  EdgesGeometry,
  Color,
  MeshBasicMaterial,
} from 'three';

type Props = JSX.IntrinsicElements['lineSegments'] & {
  geometry: BufferGeometry;

  color?: Color;
};

const geometryCache = new Map<string, EdgesGeometry>();

const lineBasicMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0.8,
  depthTest: false,
  depthWrite: false,
  color: 0x499fb6,
});

export const Edges = (props: Props) => {
  const { geometry } = props;

  const ref = useRef<LineSegments>(null);

  useLayoutEffect(() => {
    if (ref.current == null) return;

    const edges = ref.current;

    const geom = geometryCache.get(geometry.uuid);
    if (geom != null) {
      edges.geometry = geom;
    } else {
      const edgesGeometry = new EdgesGeometry(geometry);
      edges.geometry = edgesGeometry;
      geometryCache.set(geometry.uuid, edgesGeometry);
    }
  }, [geometry]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <lineSegments ref={ref} material={lineBasicMaterial} {...props} />
  );
};
