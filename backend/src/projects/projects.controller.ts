import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Get(':id/costing')
  getCosting(@Param('id') id: string) {
    return this.projectsService.getCosting(+id);
  }

  @Get(':id/budgets')
  getBudgets(@Param('id') id: string) {
    return this.projectsService.getBudgets(+id);
  }

  @Get(':id/budget-status')
  getBudgetStatus(@Param('id') id: string) {
    return this.projectsService.getBudgetStatus(+id);
  }

  @Post(':id/budgets/import')
  importBudgets(@Param('id') id: string, @Body() data: { budgets: any[] }) {
    return this.projectsService.importBudgets(+id, data.budgets);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
