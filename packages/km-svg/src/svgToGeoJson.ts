/**
 * SVG to GeoJSON conversion pipeline.
 */

import type { Result } from "km-shared";
import type {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  GeoJsonGeometry,
  LinearRing,
  Position,
} from "km-geojson";
import { featureFromGeometry, collectionFromFeatures } from "km-geojson";

import type { SvgElement, SvgGeoMeta, SvgDocument, SvgPresentationAttributes } from "./types";
import { parseSvgPath } from "./parseSvgPath";

export function svgPointToGeoPosition(
  point: [number, number],
  meta: SvgGeoMeta,
): [number, number] {
  const [west, south, east, north] = meta.geoBounds;
  const svgW = meta.svgBounds.maxX - meta.svgBounds.minX;
  const svgH = meta.svgBounds.maxY - meta.svgBounds.minY;
  const lng = west! + (point[0] - meta.svgBounds.minX) / svgW * (east! - west!);
  const lat = north! - (point[1] - meta.svgBounds.minY) / svgH * (north! - south!);
  return [lng, lat];
}

const N_CIRCLE_POINTS = 64;

function circleRing(cx: number, cy: number, rx: number, ry: number, meta: SvgGeoMeta): [number, number][] {
  const ring: [number, number][] = [];
  for (let i = 0; i <= N_CIRCLE_POINTS; i++) {
    const angle = (i / N_CIRCLE_POINTS) * 2 * Math.PI;
    ring.push(svgPointToGeoPosition([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)], meta));
  }
  return ring;
}

function pathToPoints(d: string, meta: SvgGeoMeta): { points: [number, number][]; closed: boolean } {
  const parsed = parseSvgPath(d);
  if (!parsed.success) return { points: [], closed: false };
  const BEZIER_STEPS = 20;
  let cx = 0, cy = 0, startX = 0, startY = 0;
  const points: [number, number][] = [];
  let closed = false;
  for (const cmd of parsed.data) {
    switch (cmd.cmd) {
      case "M": cx = cmd.x; cy = cmd.y; startX = cx; startY = cy; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "m": cx += cmd.x; cy += cmd.y; startX = cx; startY = cy; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "L": cx = cmd.x; cy = cmd.y; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "l": cx += cmd.x; cy += cmd.y; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "H": cx = cmd.x; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "h": cx += cmd.x; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "V": cy = cmd.y; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "v": cy += cmd.y; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "C": {
        const [ax1, ay1, ax2, ay2, ax, ay] = [cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y];
        for (let i = 1; i <= BEZIER_STEPS; i++) {
          const t = i / BEZIER_STEPS; const mt = 1 - t;
          points.push(svgPointToGeoPosition([mt*mt*mt*cx+3*mt*mt*t*ax1+3*mt*t*t*ax2+t*t*t*ax, mt*mt*mt*cy+3*mt*mt*t*ay1+3*mt*t*t*ay2+t*t*t*ay], meta));
        }
        cx = ax; cy = ay; break;
      }
      case "c": {
        const [ax1, ay1, ax2, ay2, ax, ay] = [cx+cmd.x1, cy+cmd.y1, cx+cmd.x2, cy+cmd.y2, cx+cmd.x, cy+cmd.y];
        for (let i = 1; i <= BEZIER_STEPS; i++) {
          const t = i / BEZIER_STEPS; const mt = 1 - t;
          points.push(svgPointToGeoPosition([mt*mt*mt*cx+3*mt*mt*t*ax1+3*mt*t*t*ax2+t*t*t*ax, mt*mt*mt*cy+3*mt*mt*t*ay1+3*mt*t*t*ay2+t*t*t*ay], meta));
        }
        cx = ax; cy = ay; break;
      }
      case "Q": {
        const [ax1, ay1, ax, ay] = [cmd.x1, cmd.y1, cmd.x, cmd.y];
        for (let i = 1; i <= BEZIER_STEPS; i++) {
          const t = i / BEZIER_STEPS; const mt = 1 - t;
          points.push(svgPointToGeoPosition([mt*mt*cx+2*mt*t*ax1+t*t*ax, mt*mt*cy+2*mt*t*ay1+t*t*ay], meta));
        }
        cx = ax; cy = ay; break;
      }
      case "q": {
        const [ax1, ay1, ax, ay] = [cx+cmd.x1, cy+cmd.y1, cx+cmd.x, cy+cmd.y];
        for (let i = 1; i <= BEZIER_STEPS; i++) {
          const t = i / BEZIER_STEPS; const mt = 1 - t;
          points.push(svgPointToGeoPosition([mt*mt*cx+2*mt*t*ax1+t*t*ax, mt*mt*cy+2*mt*t*ay1+t*t*ay], meta));
        }
        cx = ax; cy = ay; break;
      }
      case "Z": case "z":
        if (points.length > 0) points.push(svgPointToGeoPosition([startX, startY], meta));
        cx = startX; cy = startY; closed = true; break;
      case "S": cx = cmd.x;  cy = cmd.y;  points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "s": cx += cmd.x; cy += cmd.y; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "T": cx = cmd.x;  cy = cmd.y;  points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "t": cx += cmd.x; cy += cmd.y; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "A": cx = cmd.x;  cy = cmd.y;  points.push(svgPointToGeoPosition([cx, cy], meta)); break;
      case "a": cx += cmd.x; cy += cmd.y; points.push(svgPointToGeoPosition([cx, cy], meta)); break;
    }
  }
  return { points, closed };
}

function presAttrsToProperties(el: SvgElement): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const pres = el as unknown as SvgPresentationAttributes;
  if (pres.fill          !== undefined) props["fill"]          = JSON.stringify(pres.fill);
  if (pres.stroke        !== undefined) props["stroke"]        = JSON.stringify(pres.stroke);
  if (pres.opacity       !== undefined) props["opacity"]       = pres.opacity;
  if (pres.fillOpacity   !== undefined) props["fillOpacity"]   = pres.fillOpacity;
  if (pres.strokeWidth   !== undefined) props["strokeWidth"]   = JSON.stringify(pres.strokeWidth);
  if (pres.strokeOpacity !== undefined) props["strokeOpacity"] = pres.strokeOpacity;
  if (pres.fillRule      !== undefined) props["fillRule"]      = pres.fillRule;
  return props;
}

export function svgElementToGeoJsonFeature(
  element: SvgElement,
  meta: SvgGeoMeta,
): Result<GeoJsonFeature> {
  const props = presAttrsToProperties(element);
  try {
    let geometry: GeoJsonGeometry;
    switch (element.type) {
      case "rect": {
        const { x, y, width, height } = element;
        const ring = [
          svgPointToGeoPosition([x, y], meta),
          svgPointToGeoPosition([x + width, y], meta),
          svgPointToGeoPosition([x + width, y + height], meta),
          svgPointToGeoPosition([x, y + height], meta),
          svgPointToGeoPosition([x, y], meta),
        ] as unknown as LinearRing;
        geometry = { type: "Polygon", coordinates: [ring] };
        break;
      }
      case "circle": {
        const ring = circleRing(element.cx, element.cy, element.r, element.r, meta) as unknown as LinearRing;
        geometry = { type: "Polygon", coordinates: [ring] };
        break;
      }
      case "ellipse": {
        const ring = circleRing(element.cx, element.cy, element.rx, element.ry, meta) as unknown as LinearRing;
        geometry = { type: "Polygon", coordinates: [ring] };
        break;
      }
      case "line": {
        geometry = { type: "LineString", coordinates: [svgPointToGeoPosition([element.x1, element.y1], meta), svgPointToGeoPosition([element.x2, element.y2], meta)] as [Position, Position] };
        break;
      }
      case "polyline": {
        geometry = { type: "LineString", coordinates: element.points.map(p => svgPointToGeoPosition(p, meta)) as unknown as [Position, Position, ...Position[]] };
        break;
      }
      case "polygon": {
        const pts = element.points.map(p => svgPointToGeoPosition(p, meta));
        if (pts.length > 0) pts.push(pts[0]!);
        geometry = { type: "Polygon", coordinates: [pts as unknown as LinearRing] };
        break;
      }
      case "path": {
        const { points, closed } = pathToPoints(element.d, meta);
        if (closed && points.length >= 4) {
          geometry = { type: "Polygon", coordinates: [points as unknown as LinearRing] };
        } else {
          geometry = { type: "LineString", coordinates: points as unknown as [Position, Position, ...Position[]] };
        }
        break;
      }
      case "text": {
        geometry = { type: "Point", coordinates: svgPointToGeoPosition([element.x, element.y], meta) };
        break;
      }
      case "g": {
        const childGeometries: GeoJsonGeometry[] = [];
        for (const child of element.children) {
          const r = svgElementToGeoJsonFeature(child, meta);
          if (r.success) childGeometries.push(r.data.geometry);
        }
        geometry = { type: "GeometryCollection", geometries: childGeometries };
        break;
      }
    }
    return { success: true, data: featureFromGeometry(geometry, props) };
  } catch (err) {
    return { success: false, error: { code: "unsupported-svg-element", message: err instanceof Error ? err.message : String(err) } };
  }
}

export function svgDocumentToFeatureCollection(
  doc: SvgDocument,
  meta: SvgGeoMeta,
): Result<GeoJsonFeatureCollection> {
  const features: GeoJsonFeature[] = [];
  for (const element of doc.elements) {
    const result = svgElementToGeoJsonFeature(element, meta);
    if (result.success) features.push(result.data);
  }
  return { success: true, data: collectionFromFeatures(features) };
}
