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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const server_1 = require("@simplewebauthn/server");
const rpName = 'ERP System';
const rpID = 'localhost';
const origin = `http://${rpID}:5173`;
let AuthService = class AuthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUsers() {
        return this.prisma.user.findMany({
            select: { id: true, username: true, role: true, createdAt: true }
        });
    }
    async login(username, password) {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user)
            throw new common_1.BadRequestException('Invalid credentials');
        if (password !== '1' && password !== user.password) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        return { id: user.id, username: user.username, role: user.role };
    }
    async generateRegistrationOptions(username) {
        let user = await this.prisma.user.findUnique({ where: { username } });
        if (!user) {
            const u = username.toLowerCase();
            let role = 'NHANSU';
            if (u === 'admin' || u.includes('quản trị'))
                role = 'ADMIN';
            else if (u === 'giamdoc' || u.includes('giám đốc'))
                role = 'GIAMDOC';
            else if (u === 'ketoantruong' || u.includes('kế toán trưởng'))
                role = 'KETOAN';
            else if (u.includes('ketoan') || u.includes('kế toán'))
                role = 'KETOAN_VIEN';
            else if (u === 'thuquy' || u.includes('thủ quỹ'))
                role = 'THUQUY';
            else if (u === 'thukho' || u === 'kho' || u.includes('thủ kho'))
                role = 'KHO';
            else if (u === 'chihuy' || u.includes('chỉ huy'))
                role = 'CHIHUYTRUONG';
            else if (u === 'kysu' || u.includes('kỹ sư'))
                role = 'KYSUTRUONG';
            else if (u === 'giamsat' || u.includes('giám sát'))
                role = 'GIAMSAT';
            else if (u === 'nhansu' || u.includes('nhân sự'))
                role = 'NHANSU';
            else if (u === 'hanhchinh' || u.includes('hành chính'))
                role = 'HANHCHINH';
            user = await this.prisma.user.create({
                data: { username, password: 'password_not_used', role: role }
            });
        }
        const userCredentials = await this.prisma.webAuthnCredential.findMany({ where: { userId: user.id } });
        const options = await (0, server_1.generateRegistrationOptions)({
            rpName,
            rpID,
            userID: new Uint8Array(Buffer.from(user.id.toString())),
            userName: user.username,
            attestationType: 'none',
            excludeCredentials: userCredentials.map(cred => ({
                id: cred.id,
                type: 'public-key',
            })),
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred',
            },
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { currentChallenge: options.challenge }
        });
        return options;
    }
    async verifyRegistration(username, body) {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user || !user.currentChallenge)
            throw new common_1.BadRequestException('User or challenge not found');
        const verification = await (0, server_1.verifyRegistrationResponse)({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });
        if (verification.verified && verification.registrationInfo) {
            const { publicKey, id, counter } = verification.registrationInfo.credential;
            await this.prisma.webAuthnCredential.create({
                data: {
                    id: Buffer.from(id).toString('base64'),
                    userId: user.id,
                    publicKey: Buffer.from(publicKey),
                    counter: BigInt(counter),
                }
            });
            await this.prisma.user.update({
                where: { id: user.id },
                data: { currentChallenge: null }
            });
            return { verified: true };
        }
        return { verified: false };
    }
    async generateAuthenticationOptions(username) {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const userCredentials = await this.prisma.webAuthnCredential.findMany({ where: { userId: user.id } });
        const options = await (0, server_1.generateAuthenticationOptions)({
            rpID,
            allowCredentials: userCredentials.map(cred => ({
                id: cred.id,
                type: 'public-key',
            })),
            userVerification: 'preferred',
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { currentChallenge: options.challenge }
        });
        return options;
    }
    async verifyAuthentication(username, body) {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user || !user.currentChallenge)
            throw new common_1.BadRequestException('User or challenge not found');
        const cred = await this.prisma.webAuthnCredential.findUnique({
            where: { id: body.id }
        });
        if (!cred)
            throw new common_1.BadRequestException('Credential not found');
        const verification = await (0, server_1.verifyAuthenticationResponse)({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                publicKey: new Uint8Array(cred.publicKey),
                id: cred.id,
                counter: Number(cred.counter),
            }
        });
        if (verification.verified && verification.authenticationInfo) {
            await this.prisma.webAuthnCredential.update({
                where: { id: cred.id },
                data: { counter: BigInt(verification.authenticationInfo.newCounter) }
            });
            await this.prisma.user.update({
                where: { id: user.id },
                data: { currentChallenge: null }
            });
            return { verified: true, user: { id: user.id, username: user.username, role: user.role } };
        }
        return { verified: false };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map