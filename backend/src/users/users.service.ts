/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesService } from 'src/roles/roles.service';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { capatalizeFirstLetterOfEachWordInAphrase } from 'src/helpers/capatilize';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const organizationService = new OrganizationsService(this.prismaService);
    await organizationService.findOne(createUserDto.organizationId);

    const roleObj = await this.prismaService.role.findFirst({
      where: { name: createUserDto.role },
    });

    if (!roleObj) {
      throw new NotFoundException(
        `Unable to find the role ${createUserDto.role}`,
      );
    }
    createUserDto.roleId = roleObj.id;
    const { role, ...rest } = createUserDto;

    rest.name = capatalizeFirstLetterOfEachWordInAphrase(rest.name);
    if (await this.checkIfEmailExist(rest.email)) {
      throw new BadRequestException('this email has already taken');
    }
    if (await this.checkIfMobileExist(rest.mobile)) {
      throw new BadRequestException('this mobile number has already taken');
    }

    rest.password = await hash(rest.password, 10);

    return this.prismaService.user.create({ data: rest });
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  async findOne(id: number) {
    return this.getUserById(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.getUserById(id);

    const roleService = new RolesService(this.prismaService);
    const organizationService = new OrganizationsService(this.prismaService);

    await roleService.findOne(updateUserDto.roleId);
    await organizationService.findOne(updateUserDto.organizationId);
    const { role, ...rest } = updateUserDto;
    updateUserDto.name = capatalizeFirstLetterOfEachWordInAphrase(
      updateUserDto.name,
    );
    if (updateUserDto.name) {
      updateUserDto.name = capatalizeFirstLetterOfEachWordInAphrase(
        updateUserDto.name,
      );
    }
    if (!(await this.checkIfUserExist(updateUserDto.name, id))) {
      throw new BadRequestException(
        `User ${updateUserDto.name}has already been taken`,
      );
    }
    if (!(await this.checkIfEmailExist(updateUserDto.email, id))) {
      throw new BadRequestException(
        `User ${updateUserDto.email}has already been taken`,
      );
    }
    if (!(await this.checkIfMobileExist(updateUserDto.mobile, id))) {
      throw new BadRequestException(
        `User${updateUserDto.mobile} has already been taken`,
      );
    }
    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }
    return this.prismaService.user.update({
      where: { id },
      data: rest,
    });
  }

  async remove(id: number) {
    await this.getUserById(id);
    return this.prismaService.user.deleteMany({ where: { id } });
  }
  private async getUserById(id: number) {
    const user = await this.prismaService.user.findFirst({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ${id} does not exist`);
    }
    return user;
  }
  private async checkIfEmailExist(
    email: string,
    id?: number,
  ): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (id) {
      return user ? user.id === id : true;
    }
    return !!user;
  }

  private async checkIfMobileExist(
    mobile: string,
    id?: number,
  ): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { mobile },
    });
    if (id) {
      return user ? user.id === id : true;
    }
    return !!user;
  }
  private async checkIfUserExist(name: string, id?: number): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: { name },
    });
    if (id) {
      return user ? user.id === id : true;
    }
    return !!user;
  }
}
