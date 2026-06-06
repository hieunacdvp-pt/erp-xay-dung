"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAuditlogDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_auditlog_dto_1 = require("./create-auditlog.dto");
class UpdateAuditlogDto extends (0, mapped_types_1.PartialType)(create_auditlog_dto_1.CreateAuditlogDto) {
}
exports.UpdateAuditlogDto = UpdateAuditlogDto;
//# sourceMappingURL=update-auditlog.dto.js.map