"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const common_1 = require("@nestjs/common");
const session_service_1 = require("./session.service");
const session_response_dto_1 = require("./session-response.dto");
const types_1 = require("./types");
let SessionController = class SessionController {
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    createSession(res) {
        const session = this.sessionService.createSession();
        res.cookie('sessionId', session.id, {
            httpOnly: true,
        });
        return { message: 'Session created', credits: session.credits };
    }
    roll(req, res) {
        const sessionId = req.cookies?.sessionId;
        if (!sessionId) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ error: 'Missing sessionId' });
        }
        const session = this.sessionService.getSession(sessionId);
        if (!session) {
            return res.status(common_1.HttpStatus.NOT_FOUND).json({ error: 'Session not found' });
        }
        if (session.credits < 1) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ error: 'Not enough credits' });
        }
        const fruits = Object.values(types_1.Fruit);
        const getRandomFruit = () => fruits[Math.floor(Math.random() * fruits.length)];
        const roll = () => [getRandomFruit(), getRandomFruit(), getRandomFruit()];
        let result = roll();
        const [a, b, c] = result;
        let isWin = a === b && b === c;
        let reward = isWin ? types_1.FRUIT_REWARDS[a] : 0;
        const currentCredits = session.credits;
        let rerollChance = 0;
        if (isWin) {
            if (currentCredits >= 40 && currentCredits <= 60) {
                rerollChance = 0.3;
            }
            else if (currentCredits > 60) {
                rerollChance = 0.6;
            }
            if (Math.random() < rerollChance) {
                result = roll();
                const [r1, r2, r3] = result;
                const isRerollWin = r1 === r2 && r2 === r3;
                if (isRerollWin) {
                    reward = types_1.FRUIT_REWARDS[r1];
                    session.credits += reward;
                }
                else {
                    isWin = false;
                    session.credits -= 1;
                }
            }
            else {
                session.credits += reward;
            }
        }
        else {
            session.credits -= 1;
        }
        this.sessionService.updateSession(session);
        return {
            result,
            isWin,
            reward: isWin ? reward : 0,
            credits: session.credits,
        };
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", session_response_dto_1.SessionResponseDto)
], SessionController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('/roll'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SessionController.prototype, "roll", null);
exports.SessionController = SessionController = __decorate([
    (0, common_1.Controller)('session'),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], SessionController);
//# sourceMappingURL=session.controller.js.map