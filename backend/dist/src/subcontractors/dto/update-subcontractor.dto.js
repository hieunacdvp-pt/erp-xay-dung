"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubcontractorDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_subcontractor_dto_1 = require("./create-subcontractor.dto");
class UpdateSubcontractorDto extends (0, mapped_types_1.PartialType)(create_subcontractor_dto_1.CreateSubcontractorDto) {
}
exports.UpdateSubcontractorDto = UpdateSubcontractorDto;
//# sourceMappingURL=update-subcontractor.dto.js.map