import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    HttpException,
    HttpStatus,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { UsersService } from './user.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
  
  
  @ApiTags('users')
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
      try {
        const userId = req.user.userId;
        const user = await this.usersService.findById(userId);
    
        if (!user) {
          throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
        }
    
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      } catch (error) {
        throw new HttpException('Erro interno no servidor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Post()
    @ApiOperation({ summary: 'Cria um novo usuário' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    async createUser(@Body() createUserDto: CreateUserDto) {
      return this.usersService.createUser(createUserDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Obtém todos os usuários' })
    @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
    async findAll() {
      return this.usersService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Obtém um usuário por ID' })
    @ApiParam({ name: 'id', description: 'ID do usuário a ser obtido' })
    @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    async findOne(@Param('id') id: string) {
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }
      return user;
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Atualiza um usuário por ID' })
    @ApiParam({ name: 'id', description: 'ID do usuário a ser atualizado' })
    @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
      const updatedUser = await this.usersService.updateUser(id, updateUserDto);
      if (!updatedUser) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }
      return updatedUser;
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Remove um usuário por ID' })
    @ApiParam({ name: 'id', description: 'ID do usuário a ser removido' })
    @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    async remove(@Param('id') id: string) {
      const deletedUser = await this.usersService.deleteUser(id);
      if (!deletedUser) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }
      return deletedUser;
    }
  }
  