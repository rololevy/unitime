import { describe, expect, it } from "vitest";

import { loginEmailSchema, otpCodeSchema, safeNextPath } from "./auth";

describe("safeNextPath", () => {
  it("acepta rutas internas y conserva la query", () => {
    expect(safeNextPath("/inicio")).toBe("/inicio");
    expect(safeNextPath("/inicio/perfil?tab=1")).toBe("/inicio/perfil?tab=1");
  });

  it("descarta URLs externas y trucos de redirección abierta", () => {
    for (const evil of [
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "javascript:alert(1)",
      "evil.com",
      "/\u0000//evil.com",
      "",
      null,
      undefined,
      42,
    ]) {
      expect(safeNextPath(evil), String(evil)).toBe("/inicio");
    }
  });
});

describe("validación del login", () => {
  it("normaliza el email", () => {
    expect(loginEmailSchema.parse("  Ana@FRGP.utn.edu.ar ")).toBe("ana@frgp.utn.edu.ar");
    expect(loginEmailSchema.safeParse("no-es-email").success).toBe(false);
  });

  it("el código tiene exactamente 6 números", () => {
    expect(otpCodeSchema.parse(" 123456 ")).toBe("123456");
    for (const bad of ["12345", "1234567", "12a456", ""]) {
      expect(otpCodeSchema.safeParse(bad).success, bad).toBe(false);
    }
  });
});
