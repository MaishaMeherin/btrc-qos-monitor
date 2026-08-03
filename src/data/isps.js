export const ISPS = [
  { code: 'GP', name: 'GrameenPhone', kind: 'Mobile · Nationwide' },
  { code: 'RB', name: 'Robi', kind: 'Mobile · Nationwide' },
  { code: 'BL', name: 'Banglalink', kind: 'Mobile · Nationwide' },
  { code: 'DI', name: 'Dot Internet', kind: 'Broadband · Dhaka' },
  { code: 'BN', name: 'Bracnet', kind: 'Broadband · Nationwide' },
  { code: 'AG', name: 'Agni Systems', kind: 'Broadband · Dhaka' },
  { code: 'BT', name: 'BTCL', kind: 'Broadband · Nationwide' },
];

export const PACKAGES_BY_ISP = {
  GP: [
    { id: 'gp-15', name: 'Starter',  down: 15, up: 5,  price: 499 },
    { id: 'gp-25', name: 'Standard', down: 25, up: 8,  price: 699 },
    { id: 'gp-50', name: 'Pro',      down: 50, up: 12, price: 1099 },
  ],
  RB: [
    { id: 'rb-20', name: 'Standard', down: 20, up: 6,  price: 649 },
    { id: 'rb-40', name: 'Plus',     down: 40, up: 10, price: 999 },
  ],
  BL: [
    { id: 'bl-20', name: 'Basic',    down: 20, up: 7,  price: 599 },
    { id: 'bl-30', name: 'Standard', down: 30, up: 10, price: 799 },
    { id: 'bl-60', name: 'Pro',      down: 60, up: 15, price: 1299 },
  ],
  DI: [
    { id: 'di-20',  name: 'Home Basic',    down: 20,  up: 5,  price: 700 },
    { id: 'di-50',  name: 'Home Standard', down: 50,  up: 10, price: 1200 },
    { id: 'di-100', name: 'Home Pro',      down: 100, up: 20, price: 2200 },
    { id: 'di-200', name: 'Home Elite',    down: 200, up: 40, price: 3500 },
  ],
  BN: [
    { id: 'bn-25', name: 'Silver',   down: 25, up: 5,  price: 700 },
    { id: 'bn-40', name: 'Gold',     down: 40, up: 8,  price: 950 },
    { id: 'bn-80', name: 'Platinum', down: 80, up: 15, price: 1600 },
  ],
  AG: [
    { id: 'ag-35', name: 'Pro Home', down: 35, up: 8,  price: 899 },
    { id: 'ag-75', name: 'Pro+',     down: 75, up: 15, price: 1599 },
  ],
  BT: [
    { id: 'bt-15', name: 'Essential', down: 15, up: 3, price: 450 },
    { id: 'bt-25', name: 'Standard',  down: 25, up: 5, price: 600 },
  ],
};

export const findPkg = (ispCode, pkgId) => {
  const list = PACKAGES_BY_ISP[ispCode] || [];
  return list.find((p) => p.id === pkgId) || list[0] || null;
};

export const DISTRICTS = [
  'Dhaka','Chittagong','Khulna','Rajshahi','Sylhet','Barisal','Rangpur','Mymensingh',
  'Dhanmondi','Gazipur','Cumilla','Narayanganj','Jessore','Bogura','Tangail','Pabna',
  'Dinajpur','Noakhali','Faridpur','Kushtia',
];