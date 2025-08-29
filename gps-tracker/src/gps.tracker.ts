import { LineString } from "geojson";
import { Coordinates, CourseNode, InspectLocationResult } from "./types";
import { makeTurnInstruction, makeWarnInstruction } from "./instruction";
import turf from "@turf/turf";

// 0.001km(=1m) 이하 오차는 무시
const __PATH_TOLERANCE = 0.001;
// 0.2km(=200m) 이내로 근접해오는 지점의 안내 텍스트 조회
const __NEAR_CRITERIA = 0.2;

export class GpsTracker {
    private readonly path: LineString;
    // key = progress, value = instruction text
    private readonly turnInstructions: [number, string][];

    constructor(nodes: CourseNode[]) {

        const path = nodes.map(node => {

            const {
                location: { lon, lat },
                progress,
                bearing
            } = node;

            this.turnInstructions.push([
                progress,
                makeTurnInstruction(bearing)
            ]);

            return [lon, lat];
        });

        this.path = turf.lineString(path).geometry;
        this.turnInstructions.reverse();
    }

    inspectLocation({ lon, lat }: Coordinates): InspectLocationResult {
        const loc = [lon, lat];

        // nearest: 현재 위치와 가장 가까운 경로 위 지점의 좌표
        // progress: path의 시작점부터 nearest 까지 부분의 길이(km)
        // distance: loc와 nearest 사이의 거리(km)
        // .c.f https://turfjs.org/docs/api/nearestPointOnLine
        const {
            geometry: { coordinates: nearest },
            properties: { location: progress, dist: distance },
        } = turf.nearestPointOnLine(this.path, loc);

        const warning = distance > __PATH_TOLERANCE
            ? makeWarnInstruction(
                distance * 1000,
                turf.bearing(loc, nearest)
            ) : null;

        const turning = this.loadTurnInstructions(progress);
        return { warning, turning };
    }

    private loadTurnInstructions(currentProgress: number): string[] {
        const results: string[] = [];

        while (this.turnInstructions.length) {
            const [progress, text] = this.turnInstructions.at(-1)!;

            if (progress - currentProgress > __NEAR_CRITERIA)
                break;

            text && results.push(text);
            this.turnInstructions.pop();
        }

        return results;
    }
}