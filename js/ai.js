// AI Opponent Logic
class AIDriver {
    constructor(car, trackPoints, offset, difficulty = 0.8, startIndex = 0) {
        this.car = { ...car };
        this.x = trackPoints[startIndex].x;
        this.y = trackPoints[startIndex].y;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = (car.speed / 10) * (3.5 + difficulty * 2);
        this.acceleration = car.acceleration / 10 * 0.12;
        this.handling = car.handling / 10 * 0.06;
        this.trackPoints = trackPoints;
        this.targetIdx = (startIndex + 20) % trackPoints.length;
        this.difficulty = difficulty;
        this.lapsCompleted = 0;
        this.lastPassedStart = false;
        this.totalProgress = startIndex;
        this.nitro = 0;
        this.width = car.width;
        this.height = car.height;
        this.color = car.color;
        this.accentColor = car.accentColor;
        this.name = car.name;
        // Slight randomness per AI
        this.speedVariation = 0.85 + Math.random() * 0.3;
        this.lookahead = 20 + Math.floor(difficulty * 30);
    }

    update(dt) {
        const target = this.trackPoints[this.targetIdx];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Steer towards target
        let targetAngle = Math.atan2(dy, dx);
        let angleDiff = targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        this.angle += angleDiff * this.handling * (1 + this.difficulty * 0.5);

        // Speed up or slow down based on curve sharpness
        const absCurve = Math.abs(angleDiff);
        const curveSlowdown = 1 - absCurve * 0.4;
        const targetSpeed = this.maxSpeed * this.speedVariation * Math.max(0.4, curveSlowdown);

        if (this.speed < targetSpeed) {
            this.speed = Math.min(this.speed + this.acceleration, targetSpeed);
        } else {
            this.speed = Math.max(this.speed - this.acceleration * 2, targetSpeed);
        }

        // Move
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Advance target waypoint
        if (dist < 25) {
            this.totalProgress++;
            this.targetIdx = (this.targetIdx + 1) % this.trackPoints.length;
        }
    }

    getLapProgress(totalPoints) {
        return this.totalProgress / totalPoints;
    }
}

function createAIDrivers(selectedCar, trackPoints, numOpponents = 3) {
    const aiCars = CARS.filter((c) => c.id !== selectedCar.id);
    const drivers = [];
    const difficulties = [0.7, 0.85, 0.95];
    const startOffsets = [30, 60, 90];
    for (let i = 0; i < Math.min(numOpponents, aiCars.length); i++) {
        const idx = startOffsets[i] % trackPoints.length;
        drivers.push(new AIDriver(aiCars[i], trackPoints, startOffsets[i], difficulties[i], idx));
    }
    return drivers;
}
