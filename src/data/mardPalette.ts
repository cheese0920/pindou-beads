/** MARD 291 色 hex 映射（公共事实数据：MARD 官方色号对应表）*/
const mardToHex: Record<string, string> = {
  A01: "#FAF4C8", A02: "#FFFFD5", A03: "#FEFF8B", A04: "#FBED56", A05: "#F4D738",
  A06: "#FEAC4C", A07: "#FE8B4C", A08: "#FFDA45", A09: "#FF995B", A10: "#F77C31",
  A11: "#FFDD99", A12: "#FE9F72", A13: "#FFC365", A14: "#FD543D", A15: "#FFF365",
  A16: "#FFFF9F", A17: "#FFE36E", A18: "#FEBE7D", A19: "#FD7C72", A20: "#FFD568",
  A21: "#FFE395", A22: "#F4F57D", A23: "#E6C9B7", A24: "#F7F8A2", A25: "#FFD67D",
  A26: "#FFC830",
  B01: "#E6EE31", B02: "#63F347", B03: "#9EF780", B04: "#5DE035", B05: "#35E352",
  B06: "#65E2A6", B07: "#3DAF80", B08: "#1C9C4F", B09: "#27523A", B10: "#95D3C2",
  B11: "#5D722A", B12: "#166F41", B13: "#CAEB7B", B14: "#ADE946", B15: "#2E5132",
  B16: "#C5ED9C", B17: "#9BB13A", B18: "#E6EE49", B19: "#24B88C", B20: "#C2F0CC",
  B21: "#156A6B", B22: "#0B3C43", B23: "#303A21", B24: "#EEFCA5", B25: "#4E846D",
  B26: "#8D7A35", B27: "#CCE1AF", B28: "#9EE5B9", B29: "#C5E254", B30: "#E2FCB1",
  B31: "#B0E792", B32: "#9CAB5A",
  C01: "#E8FFE7", C02: "#A9F9FC", C03: "#A0E2FB", C04: "#41CCFF", C05: "#01ACEB",
  C06: "#50AAF0", C07: "#3677D2", C08: "#0F54C0", C09: "#324BCA", C10: "#3EBCE2",
  C11: "#28DDDE", C12: "#1C334D", C13: "#CDE8FF", C14: "#D5FDFF", C15: "#22C4C6",
  C16: "#1557A8", C17: "#04D1F6", C18: "#1D3344", C19: "#1887A2", C20: "#176DAF",
  C21: "#BEDDFF", C22: "#67B4BE", C23: "#C8E2FF", C24: "#7CC4FF", C25: "#A9E5E5",
  C26: "#3CAED8", C27: "#D3DFFA", C28: "#BBCFED", C29: "#34488E",
  D01: "#AEB4F2", D02: "#858EDD", D03: "#2F54AF", D04: "#182A84", D05: "#B843C5",
  D06: "#AC7BDE", D07: "#8854B3", D08: "#E2D3FF", D09: "#D5B9F8", D10: "#361851",
  D11: "#B9BAE1", D12: "#DE9AD4", D13: "#B90095", D14: "#8B279B", D15: "#2F1F90",
  D16: "#E3E1EE", D17: "#C4D4F6", D18: "#A45EC7", D19: "#D8C3D7", D20: "#9C32B2",
  D21: "#9A009B", D22: "#333A95", D23: "#EBDAFC", D24: "#7786E5", D25: "#494FC7",
  D26: "#DFC2F8",
  E01: "#FDD3CC", E02: "#FEC0DF", E03: "#FFB7E7", E04: "#E8649E", E05: "#F551A2",
  E06: "#F13D74", E07: "#C63478", E08: "#FFDBE9", E09: "#E970CC", E10: "#D33793",
  E11: "#FCDDD2", E12: "#F78FC3", E13: "#B5006D", E14: "#FFD1BA", E15: "#F8C7C9",
  E16: "#FFF3EB", E17: "#FFE2EA", E18: "#FFC7DB", E19: "#FEBAD5", E20: "#D8C7D1",
  E21: "#BD9DA1", E22: "#B785A1", E23: "#937A8D", E24: "#E1BCE8",
  F01: "#FD957B", F02: "#FC3D46", F03: "#F74941", F04: "#FC283C", F05: "#E7002F",
  F06: "#943630", F07: "#971937", F08: "#BC0028", F09: "#E2677A", F10: "#8A4526",
  F11: "#5A2121", F12: "#FD4E6A", F13: "#F35744", F14: "#FFA9AD", F15: "#D30022",
  F16: "#FEC2A6", F17: "#E69C79", F18: "#D37C46", F19: "#C1444A", F20: "#CD9391",
  F21: "#F7B4C6", F22: "#FDC0D0", F23: "#F67E66", F24: "#E698AA", F25: "#E54B4F",
  G01: "#FFE2CE", G02: "#FFC4AA", G03: "#F4C3A5", G04: "#E1B383", G05: "#EDB045",
  G06: "#E99C17", G07: "#9D5B3E", G08: "#753832", G09: "#E6B483", G10: "#D98C39",
  G11: "#E0C593", G12: "#FFC890", G13: "#B7714A", G14: "#8D614C", G15: "#FCF9E0",
  G16: "#F2D9BA", G17: "#78524B", G18: "#FFE4CC", G19: "#E07935", G20: "#A94023",
  G21: "#B88558",
  H01: "#FDFBFF", H02: "#FEFFFF", H03: "#B6B1BA", H04: "#89858C", H05: "#48464E",
  H06: "#2F2B2F", H07: "#000000", H08: "#E7D6DB", H09: "#EDEDED", H10: "#EEE9EA",
  H11: "#CECDD5", H12: "#FFF5ED", H13: "#F5ECD2", H14: "#CFD7D3", H15: "#98A6A8",
  H16: "#1D1414", H17: "#F1EDED", H18: "#FFFDF0", H19: "#F6EFE2", H20: "#949FA3",
  H21: "#FFFBE1", H22: "#CACAD4", H23: "#9A9D94",
  M01: "#BCC6B8", M02: "#8AA386", M03: "#697D80", M04: "#E3D2BC", M05: "#D0CCAA",
  M06: "#B0A782", M07: "#B4A497", M08: "#B38281", M09: "#A58767", M10: "#C5B2BC",
  M11: "#9F7594", M12: "#644749", M13: "#D19066", M14: "#C77362", M15: "#757D78",
  P01: "#FCF7F8", P02: "#B0A9AC", P03: "#AFDCAB", P04: "#FEA49F", P05: "#EE8C3E",
  P06: "#5FD0A7", P07: "#EB9270", P08: "#F0D958", P09: "#D9D9D9", P10: "#D9C7EA",
  P11: "#F3ECC9", P12: "#E6EEF2", P13: "#AACBEF", P14: "#337680", P15: "#668575",
  P16: "#FEBF45", P17: "#FEA324", P18: "#FEB89F", P19: "#FFFEEC", P20: "#FEBECF",
  P21: "#ECBEBF", P22: "#E4A89F", P23: "#A56268",
  Q01: "#F2A5E8", Q02: "#E9EC91", Q03: "#FFFF00", Q04: "#FFEBFA", Q05: "#76CEDE",
  R01: "#D50D21", R02: "#F92F83", R03: "#FD8324", R04: "#F8EC31", R05: "#35C75B",
  R06: "#238891", R07: "#19779D", R08: "#1A60C3", R09: "#9A56B4", R10: "#FFDB4C",
  R11: "#FFEBFA", R12: "#D8D5CE", R13: "#55514C", R14: "#9FE4DF", R15: "#77CEE9",
  R16: "#3ECFCA", R17: "#4A867A", R18: "#7FCD9D", R19: "#CDE55D", R20: "#E8C7B4",
  R21: "#AD6F3C", R22: "#6C372F", R23: "#FEB872", R24: "#F3C1C0", R25: "#C9675E",
  R26: "#D293BE", R27: "#EA8CB1", R28: "#9C87D6",
  T01: "#FFFFFF",
  Y01: "#FD6FB4", Y02: "#FEB481", Y03: "#D7FAA0", Y04: "#8BDBFA", Y05: "#E987EA",
  ZG1: "#DAABB3", ZG2: "#D6AA87", ZG3: "#C1BD8D", ZG4: "#96869F", ZG5: "#8490A6",
  ZG6: "#94BFE2", ZG7: "#E2A9D2", ZG8: "#AB91C0",
};

export function getMardHex(key: string): string | undefined {
  return mardToHex[key];
}

export function getAllMardKeys(): string[] {
  return Object.keys(mardToHex);
}

export function getAllMardPalette(): { key: string; hex: string }[] {
  return Object.entries(mardToHex).map(([key, hex]) => ({ key, hex }));
}

export type PaletteSizeKey = 'all' | '168' | '144' | '96';

export interface PaletteSizeOption {
  key: PaletteSizeKey;
  label: string;
}

export const PALETTE_OPTIONS: PaletteSizeOption[] = [
  { key: 'all', label: '291 全色' },
  { key: '168', label: '168 色' },
  { key: '144', label: '144 色' },
  { key: '96', label: '96 色' },
];

/**
 * 获取指定色板规格包含的 MARD key 清单
 * 来源：pindou.org MARD 档位表（168 = 144 + 24 扩展色，可交叉校验）
 */
const KEY_LISTS: Record<Exclude<PaletteSizeKey, 'all'>, string[]> = {
  '96': ["B3","C3","D9","E2","G1","A4","B5","C5","D6","E4","G5","A6","B8","C8","D7","F5","G7","A7",
    "H1","H2","H3","H4","H5","H7","C2","C13","D19","E8","A13","A11","C10","C6","D18","E3","A10",
    "G9","C11","C7","D21","D13","F13","G13","B12","D3","D15","E7","F8","G8","A3","B20","D16","D8",
    "E1","G2","B18","B10","D11","D12","E12","G3","B14","B19","D2","D20","E5","F10","B17","B7",
    "C16","D14","E13","F7","E11","E14","F1","A14","M6","M5","E15","F14","F9","F2","G14","M9",
    "E9","E6","F12","F3","F11","M12","D5","E10","F4","F6","G17","H6","T01"],
  '144': ["D17","D11","D2","C16","D16","D1","C7","D3","C13","C17","C6","C9","C3","C10","C5","C8","C2","C4","C11",
    "B7","B10","B6","C15","B19","D9","D6","D18","D15","D8","D12","D20","D7","D19","E9","D13","D14",
    "E8","E3","D5","D21","E2","E4","E10","E13","E12","E6","E5","E7","M6","F10","F11","G8","M5",
    "G13","G7","B11","B18","B1","B14","B17","C1","B13","B2","B8","B20","B16","B4","B12","C14",
    "B3","B5","B15","F12","F3","F6","F7","F14","F2","F9","F8","A9","F1","F13","F5","A11","A6",
    "A7","F4","A3","A13","A10","A14","A15","A4","A5","A8","H1","H12","H4","H7","H2","A1","H3",
    "H6","E11","G1","M9","H5","E14","G2","G9","G17","E1","G3","G5","M12","E15","A12","G6","G14",
    "H9","H14","H11","M15","G16","M4","M7","M8","H13","G4","M13","M14","A2","G11","G12","G10",
    "G15","M1","M2","M3","H8","H10","M10","M11","T01"],
  '168': ["D17","D11","D2","C16","D16","D1","C7","D3","C13","C17","C6","C9","C3","C10","C5","C8","C2","C4","C11",
    "B7","B10","B6","C15","B19","D9","D6","D18","D15","D8","D12","D20","D7","D19","E9","D13","D14",
    "E8","E3","D5","D21","E2","E4","E10","E13","E12","E6","E5","E7","M6","F10","F11","G8","M5",
    "G13","G7","B11","B18","B1","B14","B17","C1","B13","B2","B8","B20","B16","B4","B12","C14",
    "B3","B5","B15","F12","F3","F6","F7","F14","F2","F9","F8","A9","F1","F13","F5","A11","A6",
    "A7","F4","A3","A13","A10","A14","A15","A4","A5","A8","H1","H12","H4","H7","H2","A1","H3",
    "H6","E11","G1","M9","H5","E14","G2","G9","G17","E1","G3","G5","M12","E15","A12","G6","G14",
    "H9","H14","H11","M15","G16","M4","M7","M8","H13","G4","M13","M14","A2","G11","G12","G10",
    "G15","M1","M2","M3","H8","H10","M10","M11",
    "A16","A17","A18","A19","A20","A21","A22","A23","A24","A25","A26",
    "B9","B21","B22","B23","B24","B25","B26","B27","B28","B29","B30","B31","B32","T01"],
};

export function getPaletteKeys(size: PaletteSizeKey): string[] {
  if (size === 'all') return Object.keys(mardToHex);
  return KEY_LISTS[size];
}

export function getPaletteColors(size: PaletteSizeKey): { key: string; hex: string }[] {
  return getPaletteKeys(size)
    .map(k => ({ key: k, hex: mardToHex[k] }))
    .filter(c => !!c.hex);
}

// ===================== 中文色名 =====================
const FAMILY_NAMES: Record<string, string> = {
  A: '黄', B: '绿', C: '蓝', D: '紫', E: '粉',
  F: '红', G: '棕', H: '灰', M: '暗', P: '肤',
  Q: '荧光', R: '特', T: '透', Y: '亮', ZG: '金属',
};

/** 根据 MARD 色号获取中文色名，如 A01 → 'A01 黄' */
export function getColorName(key: string): string {
  const m = key.match(/^([A-Z]+)(\d+)$/);
  if (!m) return key;
  const family = FAMILY_NAMES[m[1]] || m[1];
  return `${key} ${family}`;
}
