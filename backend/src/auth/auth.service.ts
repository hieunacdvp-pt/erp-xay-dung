import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

const rpName = 'ERP System';
const rpID = 'localhost';
const origin = `http://${rpID}:5173`;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true }
    });
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new BadRequestException('Invalid credentials');
    // In demo ERP, password is "1" or not checked strictly, but we'll accept any password for demo purposes if it matches "1" or whatever is in db
    if (password !== '1' && password !== user.password) {
      throw new BadRequestException('Invalid credentials');
    }
    return { id: user.id, username: user.username, role: user.role };
  }

  async generateRegistrationOptions(username: string) {
    let user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      const u = username.toLowerCase();
      let role = 'NHANSU';
      if (u === 'admin' || u.includes('quản trị')) role = 'ADMIN';
      else if (u === 'giamdoc' || u.includes('giám đốc')) role = 'GIAMDOC';
      else if (u === 'ketoantruong' || u.includes('kế toán trưởng')) role = 'KETOAN';
      else if (u.includes('ketoan') || u.includes('kế toán')) role = 'KETOAN_VIEN';
      else if (u === 'thuquy' || u.includes('thủ quỹ')) role = 'THUQUY';
      else if (u === 'thukho' || u === 'kho' || u.includes('thủ kho')) role = 'KHO';
      else if (u === 'chihuy' || u.includes('chỉ huy')) role = 'CHIHUYTRUONG';
      else if (u === 'kysu' || u.includes('kỹ sư')) role = 'KYSUTRUONG';
      else if (u === 'giamsat' || u.includes('giám sát')) role = 'GIAMSAT';
      else if (u === 'nhansu' || u.includes('nhân sự')) role = 'NHANSU';
      else if (u === 'hanhchinh' || u.includes('hành chính')) role = 'HANHCHINH';

      user = await this.prisma.user.create({
        data: { username, password: 'password_not_used', role: role }
      });
    }

    const userCredentials = await this.prisma.webAuthnCredential.findMany({ where: { userId: user.id } });

    const options = await generateRegistrationOptions({
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

  async verifyRegistration(username: string, body: any) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !user.currentChallenge) throw new BadRequestException('User or challenge not found');

    const verification = await verifyRegistrationResponse({
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

  async generateAuthenticationOptions(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new BadRequestException('User not found');

    const userCredentials = await this.prisma.webAuthnCredential.findMany({ where: { userId: user.id } });

    const options = await generateAuthenticationOptions({
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

  async verifyAuthentication(username: string, body: any) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !user.currentChallenge) throw new BadRequestException('User or challenge not found');

    const cred = await this.prisma.webAuthnCredential.findUnique({
      where: { id: body.id }
    });

    if (!cred) throw new BadRequestException('Credential not found');

    const verification = await verifyAuthenticationResponse({
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
}
