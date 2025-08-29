
// 각도 변화가 10도 미만이면, 직진으로 간주
const __STRAIGHT_THRESHOLD_DEGREE = 10;

type __RotationInfo = {
    direction: "왼쪽" | "오른쪽";
    scale: "회전" | "유턴";
};

export function makeTurnInstruction(bearing: number): string {
    if (Math.abs(bearing) < __STRAIGHT_THRESHOLD_DEGREE) return "";
    const { direction, scale } = __makeRotationInfo(bearing);
    return `잠시후 ${direction}으로 ${scale} 있습니다. 앱을 확인해 주세요`;
}

export function makeWarnInstruction(distance: number, bearing: number): string {
    const { direction, scale } = __makeRotationInfo(bearing);

    return `
        경로에서 벗어났습니다. ${direction}으로 ${scale} 후
        ${distance}m 이동해주세요!
        `;
}


function __makeRotationInfo(bearing: number): __RotationInfo {
    return {
        direction: bearing > 0 ? "왼쪽" : "오른쪽",
        scale: Math.abs(bearing) > 150 ? "유턴" : "회전"
    };
}