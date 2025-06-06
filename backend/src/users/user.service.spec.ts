import { ForbiddenException } from '@nestjs/common';
import { UsersService } from './user.service';

describe('UsersService.updateUserRole', () => {
  let service: UsersService;
  let prisma: { user: { update: jest.Mock } };

  beforeEach(() => {
    prisma = {
      user: {
        update: jest.fn(),
      },
    };
    service = new UsersService(prisma as any);
  });

  it.each(['admin', 'developer', 'user'])('updates role when role is %s', async (role) => {
    const id = '123';
    const updated = { id, role };
    prisma.user.update.mockResolvedValue(updated);

    const result = await service.updateUserRole(id, role);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id },
      data: { role },
    });
    expect(result).toEqual(updated);
  });

  it('throws ForbiddenException for invalid role', async () => {
    const id = '123';
    await expect(service.updateUserRole(id, 'invalid')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
