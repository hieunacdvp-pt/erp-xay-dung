"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRequisitionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_requisition_dto_1 = require("./create-requisition.dto");
class UpdateRequisitionDto extends (0, mapped_types_1.PartialType)(create_requisition_dto_1.CreateRequisitionDto) {
}
exports.UpdateRequisitionDto = UpdateRequisitionDto;
//# sourceMappingURL=update-requisition.dto.js.map