/**
 * DE L'AMOUR DIGITAL FLAGSHIP STORE - ORDER & NOTIFICATION ENGINE
 * Phase 1: Chuẩn hóa Địa chỉ 3 Cấp & Bắn Đơn Hàng Tức Thì Về Telegram Bot
 */

const ORDER_ENGINE_STORAGE_KEYS = {
  TG_BOT_TOKEN: 'delamour_tg_bot_token',
  TG_CHAT_ID: 'delamour_tg_chat_id',
  ORDERS_HISTORY: 'delamour_orders_history',
  CUSTOMER_INFO: 'delamour_customer_info',
  VOUCHERS: 'delamour_custom_vouchers',
  DISCOVERY_PURCHASES: 'delamour_discovery_purchases',
  USED_VOUCHERS_DEVICE: 'delamour_used_vouchers_device',
  GEMINI_KEY: 'delamour_gemini_api_key',
  GEMINI_MODEL: 'delamour_gemini_model',
  GEMINI_PROMPT: 'delamour_gemini_prompt',
  BANK_ID: 'delamour_bank_id',
  BANK_ACC: 'delamour_bank_acc',
  BANK_NAME: 'delamour_bank_name',
  ADMIN_PASS: 'delamour_admin_pass',
  STAFF_PASS: 'delamour_staff_pass',
  USER_ROLE: 'delamour_user_role'
};

const DEFAULT_BANK_CONFIG = {
  bankId: 'MB',
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  accountNo: '8888666999',
  accountName: 'CTY DE LAMOUR VIETNAM'
};

function getBankConfig() {
  try {
    return {
      bankId: localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.BANK_ID) || DEFAULT_BANK_CONFIG.bankId,
      bankName: DEFAULT_BANK_CONFIG.bankName,
      accountNo: localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.BANK_ACC) || DEFAULT_BANK_CONFIG.accountNo,
      accountName: localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.BANK_NAME) || DEFAULT_BANK_CONFIG.accountName
    };
  } catch(e) {
    return { ...DEFAULT_BANK_CONFIG };
  }
}

function saveBankConfig(cfg) {
  try {
    if (cfg.bankId) localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.BANK_ID, cfg.bankId);
    if (cfg.accountNo) localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.BANK_ACC, cfg.accountNo);
    if (cfg.accountName) localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.BANK_NAME, cfg.accountName);
  } catch(e) {}
}

function generateVietQRUrl(amount, orderCode) {
  const bank = getBankConfig();
  const amt = Math.max(0, Number(amount) || 0);
  const memo = encodeURIComponent(`DELAMOUR ${orderCode}`);
  const name = encodeURIComponent(bank.accountName);
  return `https://img.vietqr.io/image/${bank.bankId}-${bank.accountNo}-compact2.png?amount=${amt}&addInfo=${memo}&accountName=${name}`;
}

// Cấu hình Voucher mặc định hệ thống
const DEFAULT_VOUCHERS = [
  { 
    code: 'DELAMOUR50', 
    type: 'fixed', 
    value: 50000, 
    minSpend: 0, 
    desc: 'Ưu đãi chào mừng thành viên mới (Giảm 50.000đ)',
    targetProduct: 'all',
    condition: 'none',
    expiryType: 'none',
    expiryDate: '',
    daysLimit: 0,
    oneTimePerCustomer: false,
    usedPhones: []
  },
  { 
    code: 'PARIS50', 
    type: 'fixed', 
    value: 50000, 
    minSpend: 0, 
    desc: 'Quà tặng Paris Haute Parfumerie (Giảm 50.000đ)',
    targetProduct: 'all',
    condition: 'none',
    expiryType: 'none',
    expiryDate: '',
    daysLimit: 0,
    oneTimePerCustomer: false,
    usedPhones: []
  },
  { 
    code: 'VALENTINE', 
    type: 'percent', 
    value: 15, 
    minSpend: 399000, 
    desc: 'Mùa yêu thương (Giảm 15% cho đơn từ 399.000đ)',
    targetProduct: 'all',
    condition: 'none',
    expiryType: 'none',
    expiryDate: '',
    daysLimit: 0,
    oneTimePerCustomer: false,
    usedPhones: []
  },
  { 
    code: 'FREESHIP', 
    type: 'fixed', 
    value: 30000, 
    minSpend: 299000, 
    desc: 'Hỗ trợ phí vận chuyển toàn quốc (-30.000đ)',
    targetProduct: 'all',
    condition: 'none',
    expiryType: 'none',
    expiryDate: '',
    daysLimit: 0,
    oneTimePerCustomer: false,
    usedPhones: []
  },
  { 
    code: 'POCKET30', 
    type: 'fixed', 
    value: 26700, 
    minSpend: 0, 
    desc: 'Đặc quyền Discovery Set: Giảm 26.700đ (~30%) khi mua chai Pocket 10ml trong vòng 15 ngày (Dùng 1 lần)',
    targetProduct: 'pocket',
    condition: 'discovery',
    expiryType: 'days_from_discovery',
    daysLimit: 15,
    oneTimePerCustomer: true,
    usedPhones: []
  },
  { 
    code: 'SIGNATURE50', 
    type: 'fixed', 
    value: 44500, 
    minSpend: 0, 
    desc: 'Đặc quyền Discovery Set: Giảm 44.500đ (~50%) khi mua chai Signature 50ml trong vòng 15 ngày (Dùng 1 lần)',
    targetProduct: 'signature',
    condition: 'discovery',
    expiryType: 'days_from_discovery',
    daysLimit: 15,
    oneTimePerCustomer: true,
    usedPhones: []
  }
];

/**
 * 0. VOUCHER & DISCOUNT ENGINE (MÃ GIẢM GIÁ ĐỘNG & ĐIỀU KIỆN ĐẶC QUYỀN)
 */
function getCustomVouchers() {
  try {
    const raw = localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.VOUCHERS);
    let list = [];
    if (!raw) {
      list = [...DEFAULT_VOUCHERS];
      localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.VOUCHERS, JSON.stringify(list));
    } else {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_VOUCHERS];
    }

    // Tự động nâng cấp / đồng bộ thuộc tính nâng cao cho các mã cũ
    let needsUpdate = false;
    list = list.map(v => {
      const copy = { ...v };
      const codeUpper = String(copy.code || '').toUpperCase();

      if (codeUpper === 'POCKET30') {
        copy.value = 26700;
        copy.type = 'fixed';
        copy.targetProduct = 'pocket';
        copy.condition = 'discovery';
        copy.daysLimit = 15;
        copy.oneTimePerCustomer = true;
        needsUpdate = true;
      } else if (codeUpper === 'SIGNATURE50') {
        copy.value = 44500;
        copy.type = 'fixed';
        copy.targetProduct = 'signature';
        copy.condition = 'discovery';
        copy.daysLimit = 15;
        copy.oneTimePerCustomer = true;
        needsUpdate = true;
      }

      if (!copy.targetProduct) copy.targetProduct = 'all';
      if (!copy.condition) copy.condition = 'none';
      if (!copy.expiryType) copy.expiryType = copy.expiryDate ? 'fixed_date' : (copy.daysLimit ? 'days_from_discovery' : 'none');
      if (!Array.isArray(copy.usedPhones)) copy.usedPhones = [];
      return copy;
    });

    // Nếu trong danh sách chưa có POCKET30 hoặc SIGNATURE50, bổ sung vào
    const hasPocket30 = list.some(v => v.code.toUpperCase() === 'POCKET30');
    const hasSig50 = list.some(v => v.code.toUpperCase() === 'SIGNATURE50');
    if (!hasPocket30) {
      list.push(DEFAULT_VOUCHERS.find(v => v.code === 'POCKET30'));
      needsUpdate = true;
    }
    if (!hasSig50) {
      list.push(DEFAULT_VOUCHERS.find(v => v.code === 'SIGNATURE50'));
      needsUpdate = true;
    }

    if (needsUpdate) {
      try { localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.VOUCHERS, JSON.stringify(list)); } catch(e){}
    }

    return list;
  } catch (e) {
    return [...DEFAULT_VOUCHERS];
  }
}

function saveCustomVouchers(list) {
  try {
    localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.VOUCHERS, JSON.stringify(list));
  } catch (e) {
    console.error('[Voucher] Lỗi lưu voucher:', e);
  }
}

/**
 * Ghi nhận khách hàng mua Discovery Set
 */
function recordDiscoveryPurchase(order) {
  if (!order) return;
  try {
    const list = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.DISCOVERY_PURCHASES) || '[]');
    const cleanPhone = String(order.customerPhone || '').replace(/[\s\-\.]/g, '').replace(/^\+84/, '0');
    const record = {
      orderCode: order.orderCode || 'ORD-' + Date.now(),
      phone: cleanPhone,
      date: order.createdAt || new Date().toISOString()
    };
    list.unshift(record);
    if (list.length > 200) list.pop();
    localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.DISCOVERY_PURCHASES, JSON.stringify(list));
    localStorage.setItem('delamour_last_discovery_order', JSON.stringify(record));
  } catch (e) {
    console.error('[Discovery Purchase] Lỗi ghi nhận:', e);
  }
}

/**
 * Tra cứu lịch sử mua Discovery Set của khách hàng
 * Trả về: { hasBought: boolean, orderDate: Date|null, diffDays: number|null, orderCode: string|null, phone: string|null }
 */
function getCustomerDiscoveryHistory(phone = '') {
  const cleanPhone = String(phone || '').replace(/[\s\-\.]/g, '').replace(/^\+84/, '0');

  // Bắt buộc phải có Số điện thoại để xác thực khách hàng đã từng mua Discovery Set
  if (!cleanPhone || cleanPhone.length < 8) {
    return { hasBought: false, needPhone: true, diffDays: null, orderDate: null, orderCode: null, phone: null };
  }

  let purchases = [];
  try { purchases = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.DISCOVERY_PURCHASES) || '[]'); } catch (e) { purchases = []; }

  let orders = [];
  try { orders = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.ORDERS_HISTORY) || '[]'); } catch (e) { orders = []; }

  // Tra cứu chính xác theo Số điện thoại của khách hàng
  let matched = purchases.find(p => p.phone && p.phone === cleanPhone);
  if (!matched) {
    const matchedOrder = orders.find(o => {
      const oPhone = String(o.customerPhone || '').replace(/[\s\-\.]/g, '').replace(/^\+84/, '0');
      const hasDisc = Array.isArray(o.items) && o.items.some(i => i.name && i.name.toLowerCase().includes('discovery'));
      return oPhone === cleanPhone && hasDisc;
    });
    if (matchedOrder) {
      matched = {
        orderCode: matchedOrder.orderCode,
        phone: cleanPhone,
        date: matchedOrder.createdAt || matchedOrder.savedAt
      };
    }
  }

  if (!matched || !matched.date) {
    return { hasBought: false, needPhone: false, diffDays: null, orderDate: null, orderCode: null, phone: cleanPhone };
  }

  const orderDate = new Date(matched.date);
  const now = new Date();
  const diffMs = now.getTime() - orderDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  return {
    hasBought: true,
    needPhone: false,
    orderCode: matched.orderCode,
    orderDate: orderDate,
    diffDays: diffDays,
    phone: cleanPhone
  };
}

/**
 * Kiểm tra xem khách hàng đã dùng voucher 1 lần này chưa
 */
function isVoucherUsedByCustomer(voucher, phone = '') {
  if (!voucher) return false;
  const cleanPhone = String(phone || '').replace(/[\s\-\.]/g, '').replace(/^\+84/, '0');
  const code = voucher.code.toUpperCase();

  // Kiểm tra trên thiết bị nếu chưa có SĐT
  if (!cleanPhone) {
    try {
      const usedMap = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.USED_VOUCHERS_DEVICE) || '{}');
      if (usedMap[code]) return true;
    } catch (e) {}
    return false;
  }

  // 1. Kiểm tra mảng usedPhones trong voucher
  if (Array.isArray(voucher.usedPhones) && voucher.usedPhones.includes(cleanPhone)) {
    return true;
  }

  // 2. Kiểm tra trong lịch sử đơn hàng
  try {
    const orders = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.ORDERS_HISTORY) || '[]');
    const hasUsed = orders.some(o => {
      const oPhone = String(o.customerPhone || '').replace(/[\s\-\.]/g, '').replace(/^\+84/, '0');
      return oPhone === cleanPhone && String(o.voucherCode || '').toUpperCase() === code;
    });
    if (hasUsed) return true;
  } catch (e) {}

  return false;
}

/**
 * Ghi nhận voucher đã được khách hàng sử dụng
 */
function recordVoucherUsage(code, phone = '', orderCode = '') {
  if (!code) return;
  const cleanCode = String(code).trim().toUpperCase();
  const cleanPhone = String(phone || '').replace(/[\s\-\.]/g, '').replace(/^\+84/, '0');

  // Ghi nhận trên thiết bị
  try {
    const usedMap = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.USED_VOUCHERS_DEVICE) || '{}');
    usedMap[cleanCode] = (usedMap[cleanCode] || 0) + 1;
    localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.USED_VOUCHERS_DEVICE, JSON.stringify(usedMap));
  } catch (e) {}

  // Ghi nhận trong danh sách voucher
  try {
    const list = getCustomVouchers();
    const v = list.find(item => item.code.toUpperCase() === cleanCode);
    if (v) {
      if (!Array.isArray(v.usedPhones)) v.usedPhones = [];
      if (cleanPhone && !v.usedPhones.includes(cleanPhone)) {
        v.usedPhones.push(cleanPhone);
      }
      v.usageCount = (v.usageCount || 0) + 1;
      saveCustomVouchers(list);
    }
  } catch (e) {
    console.error('[Voucher Usage] Lỗi ghi nhận lượt dùng:', e);
  }
}

/**
 * VALIDATE VOUCHER TOÀN DIỆN (ĐIỀU KIỆN SẢN PHẨM, HẠN DÙNG, ĐẶC QUYỀN DISCOVERY SET)
 * options: { isCart: boolean } - Nếu isCart = true (ở Giỏ hàng): chỉ kiểm tra sản phẩm & đơn tối thiểu,
 * tạm chấp nhận voucher đặc quyền và sẽ xác thực SĐT nghiêm ngặt tại bước Thanh toán.
 */
function validateAndCalculateVoucher(code, subtotal = 0, cartItems = null, customerPhone = '', options = {}) {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) {
    return { valid: false, message: 'Vui lòng nhập mã Voucher!' };
  }

  // Hỗ trợ mã voucher sinh ra từ Scent Quiz
  if (clean.startsWith('DELAMOUR50-')) {
    return {
      valid: true,
      discount: 50000,
      code: clean,
      message: `Áp dụng mã Quiz ${clean}: Giảm trực tiếp 50.000đ!`
    };
  }

  // Tự động lấy cartItems và customerPhone từ window/DOM nếu không truyền
  if (!cartItems && typeof window !== 'undefined' && Array.isArray(window.cartItems)) {
    cartItems = window.cartItems;
  }
  if (!customerPhone && typeof document !== 'undefined') {
    customerPhone = document.getElementById('order-phone')?.value || '';
    if (!customerPhone) {
      try {
        const stored = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.CUSTOMER_INFO) || '{}');
        customerPhone = stored.phone || '';
      } catch (e) {}
    }
  }
  const cleanPhone = String(customerPhone || '').replace(/[\s\-\.]/g, '').replace(/^\+84/, '0');

  const list = getCustomVouchers();
  const v = list.find(item => item.code.toUpperCase() === clean);

  if (!v) {
    return {
      valid: false,
      message: 'Mã voucher không tồn tại hoặc đã bị xóa.'
    };
  }

  // Khóa cứng giá trị chuẩn xác cho 2 mã đặc quyền Discovery Set
  if (v.code.toUpperCase() === 'SIGNATURE50') {
    v.value = 44500;
    v.type = 'fixed';
    v.targetProduct = 'signature';
    v.condition = 'discovery';
    v.daysLimit = 15;
    v.oneTimePerCustomer = true;
  } else if (v.code.toUpperCase() === 'POCKET30') {
    v.value = 26700;
    v.type = 'fixed';
    v.targetProduct = 'pocket';
    v.condition = 'discovery';
    v.daysLimit = 15;
    v.oneTimePerCustomer = true;
  }

  // 1. Kiểm tra Hạn sử dụng cố định (expiryDate)
  if (v.expiryDate) {
    const expDate = new Date(v.expiryDate + (v.expiryDate.includes('T') ? '' : 'T23:59:59'));
    if (!isNaN(expDate.getTime()) && Date.now() > expDate.getTime()) {
      const expStr = expDate.toLocaleDateString('vi-VN');
      return {
        valid: false,
        message: `Mã voucher ${v.code} đã hết hạn sử dụng vào ngày ${expStr}!`
      };
    }
  }

  // 2. Kiểm tra Đơn tối thiểu (minSpend)
  const minSpend = Number(v.minSpend) || 0;
  if (subtotal < minSpend) {
    const fmtMin = new Intl.NumberFormat('vi-VN').format(minSpend) + 'đ';
    return {
      valid: false,
      message: `Đơn hàng cần tối thiểu ${fmtMin} để áp dụng mã ${v.code}!`
    };
  }

  // 3. Kiểm tra Dòng sản phẩm hợp lệ trong giỏ hàng (targetProduct)
  // 'all' | 'pocket' | 'signature' | 'pocket_or_signature'
  const items = Array.isArray(cartItems) ? cartItems : [];
  if (v.targetProduct && v.targetProduct !== 'all' && items.length > 0) {
    const hasPocket = items.some(i => {
      const s = String(i.size || '').toLowerCase();
      const n = String(i.name || '').toLowerCase();
      return s.includes('10ml') || s.includes('pocket') || n.includes('pocket');
    });

    const hasSignature = items.some(i => {
      const s = String(i.size || '').toLowerCase();
      const n = String(i.name || '').toLowerCase();
      return s.includes('50ml') || s.includes('signature') || n.includes('signature') || 
             (!s.includes('10ml') && !n.includes('pocket') && !n.includes('discovery') && !n.includes('hộp quà') && !n.includes('gifting'));
    });

    if (v.targetProduct === 'pocket' && !hasPocket) {
      return {
        valid: false,
        message: `Mã ${v.code} chỉ áp dụng cho đơn hàng mua nước hoa chai Pocket 10ml!`
      };
    }

    if (v.targetProduct === 'signature' && !hasSignature) {
      return {
        valid: false,
        message: `Mã ${v.code} chỉ áp dụng cho đơn hàng mua nước hoa chai Signature 50ml!`
      };
    }

    if (v.targetProduct === 'pocket_or_signature' && !hasPocket && !hasSignature) {
      return {
        valid: false,
        message: `Mã ${v.code} chỉ áp dụng khi mua nước hoa dạng chai Pocket 10ml hoặc Signature 50ml!`
      };
    }
  }

  // 4. Tính toán giá trị giảm
  let discount = 0;
  if (v.type === 'percent') {
    discount = Math.round(subtotal * (Number(v.value) / 100));
  } else {
    discount = Math.min(subtotal, Number(v.value) || 0);
  }

  const fmtDiscount = new Intl.NumberFormat('vi-VN').format(discount) + 'đ';
  const desc = v.type === 'percent' ? `${v.value}%` : fmtDiscount;

  // 5. ĐIỀU KIỆN ĐẶC QUYỀN DISCOVERY SET HOẶC VOUCHER 1 LẦN
  const requiresDiscovery = v.condition === 'discovery' || v.requireDiscovery === true;
  const isOneTime = v.oneTimePerCustomer === true;

  // Nếu đang gọi từ GIỎ HÀNG (options.isCart = true):
  // Giỏ hàng không có ô SĐT -> Cho phép áp dụng tạm, tính trừ vào tạm tính ngay để khách an tâm,
  // hiển thị thông báo thân thiện giải thích sẽ xác thực SĐT tại bước Thanh toán.
  if (options && options.isCart) {
    let cartMsg = `Áp dụng thành công ${v.code}: Giảm ${desc}!`;
    if (requiresDiscovery) {
      cartMsg = `Đã nhận mã ${v.code}: Tạm giảm ${desc}! (Hệ thống sẽ xác thực SĐT mua Discovery Set tại bước Thanh toán)`;
    }
    return {
      valid: true,
      code: v.code,
      discount: discount,
      voucher: v,
      isCartPending: (requiresDiscovery || isOneTime),
      requiresDiscovery: requiresDiscovery,
      isOneTime: isOneTime,
      message: cartMsg
    };
  }

  // TẠI BƯỚC THANH TOÁN (Checkout Modal hoặc Hoàn tất đơn)
  if (requiresDiscovery || isOneTime) {
    if (!cleanPhone || cleanPhone.length < 9) {
      return {
        valid: false,
        requirePhone: true,
        voucher: v,
        discount: discount,
        message: `Mã ${v.code} là ưu đãi đặc quyền. Vui lòng nhập Số điện thoại nhận hàng bên trên để xác thực điều kiện!`
      };
    }

    if (requiresDiscovery) {
      const discInfo = getCustomerDiscoveryHistory(cleanPhone);
      if (!discInfo.hasBought) {
        return {
          valid: false,
          notEligible: true,
          voucher: v,
          message: `Số điện thoại ${cleanPhone} chưa từng đặt mua Bộ mẫu thử Discovery Set để áp dụng mã ${v.code}!`
        };
      }

      // Kiểm tra giới hạn số ngày hiệu lực (mặc định 15 ngày)
      const maxDays = Number(v.daysLimit) || 15;
      if (discInfo.diffDays !== null && discInfo.diffDays > maxDays) {
        return {
          valid: false,
          expiredDiscovery: true,
          voucher: v,
          message: `Mã ${v.code} đã hết hạn! Ưu đãi chỉ áp dụng trong vòng ${maxDays} ngày kể từ ngày mua Discovery Set (SĐT ${cleanPhone} đã mua cách đây ${discInfo.diffDays} ngày).`
        };
      }
    }

    if (isOneTime) {
      if (isVoucherUsedByCustomer(v, cleanPhone)) {
        return {
          valid: false,
          alreadyUsed: true,
          voucher: v,
          message: `Số điện thoại ${cleanPhone} đã từng sử dụng mã ${v.code} rồi (Mỗi khách hàng chỉ được dùng 1 lần duy nhất)!`
        };
      }
    }
  }

  let successMsg = `Áp dụng thành công ${v.code}: Giảm ${desc} (-${fmtDiscount})!`;
  if (requiresDiscovery) {
    successMsg = `Xác thực SĐT ${cleanPhone} thành công! Đủ điều kiện mã ${v.code}: Giảm ${desc} (-${fmtDiscount})!`;
  }

  return {
    valid: true,
    code: v.code,
    discount: discount,
    voucher: v,
    verified: (requiresDiscovery || isOneTime),
    requiresDiscovery: requiresDiscovery,
    isOneTime: isOneTime,
    message: successMsg
  };
}

// Expose to window for global access
window.getCustomVouchers = getCustomVouchers;
window.saveCustomVouchers = saveCustomVouchers;
window.validateAndCalculateVoucher = validateAndCalculateVoucher;
window.recordDiscoveryPurchase = recordDiscoveryPurchase;
window.getCustomerDiscoveryHistory = getCustomerDiscoveryHistory;
window.recordVoucherUsage = recordVoucherUsage;
window.isVoucherUsedByCustomer = isVoucherUsedByCustomer;

// Cấu hình mặc định (Chủ shop có thể điền trực tiếp vào đây hoặc cài qua giao diện)
const DEFAULT_TG_CONFIG = {
  botToken: '', // Ví dụ: '7123456789:AAHxxxxx...'
  chatId: ''    // Ví dụ: '123456789' hoặc '-100xxxx' cho group
};

// Bộ nhớ đệm danh mục địa chính
const addressCache = {
  provinces: null,
  districts: {},
  wards: {}
};

/**
 * 1. QUẢN LÝ CẤU HÌNH TELEGRAM BOT
 */
function getTelegramConfig() {
  const token = localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.TG_BOT_TOKEN) || DEFAULT_TG_CONFIG.botToken;
  const chatId = localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.TG_CHAT_ID) || DEFAULT_TG_CONFIG.chatId;
  return { token: token.trim(), chatId: chatId.trim() };
}

function saveTelegramConfig(token, chatId) {
  localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.TG_BOT_TOKEN, (token || '').trim());
  localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.TG_CHAT_ID, (chatId || '').trim());
}

/**
 * Gửi tin nhắn đến Telegram (Hỗ trợ 2 lớp: Serverless Proxy ẩn Token + Client Fallback)
 */
async function sendTelegramMessage(htmlContent) {
  const config = getTelegramConfig();

  // LỚP 1: Thử gọi qua Vercel Serverless Proxy (/api/telegram) để giấu hoàn toàn Token
  try {
    const proxyRes = await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        htmlContent: htmlContent,
        chatId: config.chatId,
        token: config.token
      })
    });
    if (proxyRes.ok) {
      const pData = await proxyRes.json();
      if (pData.success) {
        return { success: true, result: pData.result, proxy: true };
      }
    }
  } catch (proxyErr) {
    // Chạy môi trường local/file không có serverless -> tự động chuyển sang Lớp 2 bên dưới
  }

  // LỚP 2: Fallback gọi trực tiếp Telegram REST API (khi chạy offline / local preview)
  if (!config.token || !config.chatId) {
    console.warn("[De L'amour Bot] Chưa cấu hình Telegram Bot Token hoặc Chat ID. Vui lòng bấm vào 'Cài đặt Telegram' ở chân trang.");
    return { success: false, reason: 'missing_config' };
  }

  const endpoint = `https://api.telegram.org/bot${config.token}/sendMessage`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: htmlContent,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const result = await response.json();
    if (result.ok) {
      return { success: true, result, proxy: false };
    } else {
      console.error("[De L'amour Bot] Lỗi từ Telegram API:", result);
      return { success: false, reason: result.description };
    }
  } catch (error) {
    console.error("[De L'amour Bot] Lỗi mạng khi gọi Telegram:", error);
    return { success: false, reason: error.message };
  }
}

/**
 * Kiểm tra kết nối Telegram (Bắn tin thử nghiệm)
 */
async function testTelegramConnection() {
  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const message = `🔔 <b>[De L'amour Paris] KIỂM TRA KẾT NỐI</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ <i>Kết nối Telegram Bot thành công!</i>\n` +
    `⏰ Thời gian: <b>${now}</b>\n` +
    `📱 Hệ thống đã sẵn sàng bắn thông báo chuông reo tức thì khi có khách đặt nước hoa hoặc để lại SĐT tư vấn!`;

  return await sendTelegramMessage(message);
}

/**
 * BẮN THÔNG BÁO XÁC NHẬN THANH TOÁN THÀNH CÔNG VỀ TELEGRAM BOT
 */
async function sendPaymentSuccessToTelegram(order) {
  const token = getTelegramToken();
  const chatId = getTelegramChatId();
  if (!token || !chatId) return { success: false, message: 'Chưa cấu hình Telegram' };

  const nowStr = new Date().toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const formattedTotal = new Intl.NumberFormat('vi-VN').format(order.finalAmount || 0) + 'đ';

  const message = `🎉 <b>[THANH TOÁN THÀNH CÔNG]</b> 🎉\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>Trạng thái:</b> <b>ĐÃ THANH TOÁN VIETQR (Napas 247)</b>\n` +
    `🔖 <b>Mã đơn:</b> <code>#${order.orderCode}</code>\n` +
    `💵 <b>Số tiền khớp lệnh:</b> <b>${formattedTotal}</b>\n` +
    `👤 <b>Khách hàng:</b> ${order.customerName}\n` +
    `📞 <b>SĐT:</b> <a href="tel:${order.customerPhone}">${order.customerPhone}</a>\n` +
    `📍 <b>Địa chỉ:</b> ${order.customerAddress}\n` +
    `⏰ <b>Thời gian khớp:</b> ${nowStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ <i>Hệ thống tự động chuyển đơn sang: ĐANG CHẾ TÁC & ĐÓNG GÓI!</i>`;

  return await sendTelegramMessage(message);
}

/**
 * 2. ĐỊNH DẠNG & BẮN ĐƠN HÀNG VỀ TELEGRAM
 */
async function sendOrderToTelegram(order) {
  const nowStr = new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formattedTotal = new Intl.NumberFormat('vi-VN').format(order.finalAmount || order.total) + 'đ';
  const formattedSubtotal = new Intl.NumberFormat('vi-VN').format(order.subtotal) + 'đ';

  let itemsText = '';
  if (Array.isArray(order.items) && order.items.length > 0) {
    order.items.forEach((item, idx) => {
      const priceFmt = new Intl.NumberFormat('vi-VN').format(item.price + (item.extraPrice || 0)) + 'đ';
      itemsText += `\n${idx + 1}. <b>${item.name}</b> (${item.size || 'Tiêu chuẩn'})`;
      itemsText += `\n   ▫️ SL: <b>${item.quantity}</b> × ${priceFmt}`;
      
      // Khắc laser nắp chai
      if (item.personalization === 'engraving' || (item.personalizationText && item.personalizationText.includes('Khắc'))) {
        itemsText += `\n   ✍️ <i>Cá nhân hóa:</i> <b>${item.personalizationText}</b>`;
      } else if (item.personalization === 'giftwrap' || (item.personalizationText && item.personalizationText.includes('Gói quà'))) {
        itemsText += `\n   🎁 <i>Đóng gói:</i> <b>${item.personalizationText}</b>`;
      } else if (item.personalizationText && item.personalizationText !== 'Hộp tiêu chuẩn De L\'amour') {
        itemsText += `\n   ▫️ <i>Chi tiết:</i> ${item.personalizationText}`;
      }
    });
  } else {
    itemsText = '\n<i>(Không có sản phẩm)</i>';
  }

  // Voucher
  let voucherText = '';
  if (order.voucherCode) {
    const discountFmt = new Intl.NumberFormat('vi-VN').format(order.discount || 0) + 'đ';
    voucherText = `\n🎟️ <b>Voucher:</b> <code>${order.voucherCode}</code> (-${discountFmt})`;
  }

  // Thanh toán
  let paymentText = '💵 <b>Thanh toán khi nhận hàng (COD)</b>';
  if (order.paymentMethod === 'vietqr') {
    paymentText = '💳 <b>Quét mã VietQR (Napas 247)</b>';
  } else if (order.paymentMethod === 'momo') {
    paymentText = '📱 <b>Ví Điện tử MoMo / VNPay</b>';
  }

  const message = `🌹 <b>ĐƠN HÀNG MỚI #${order.orderCode}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Khách hàng:</b> ${order.customerName}\n` +
    `📞 <b>SĐT:</b> <a href="tel:${order.customerPhone}">${order.customerPhone}</a>\n` +
    `📍 <b>Địa chỉ:</b> ${order.customerAddress}\n` +
    (order.customerNote ? `📝 <b>Ghi chú:</b> <i>${order.customerNote}</i>\n` : '') +
    `⏰ <b>Thời gian:</b> ${nowStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🛍️ <b>CHI TIẾT ĐƠN HÀNG:</b>${itemsText}\n` +
    voucherText + `\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💳 <b>Phương thức:</b> ${paymentText}\n` +
    `💰 <b>TỔNG THANH TOÁN:</b> <b>${formattedTotal}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ <i>Vui lòng chuẩn bị đóng gói & liên hệ khách xác nhận đơn!</i>`;

  // Lưu vào lịch sử đơn hàng LocalStorage
  saveOrderToHistory(order);

  // Bắn thông báo qua Telegram
  return await sendTelegramMessage(message);
}

/**
 * 3. BẮN LEAD TƯ VẤN (TỪ QUIZ HOẶC AI CHATBOT)
 */
async function sendLeadToTelegram(type, data) {
  const nowStr = new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  let title = "🎯 <b>KHÁCH ĐỂ LẠI SĐT TƯ VẤN</b>";
  let details = "";

  if (type === 'quiz') {
    title = "✨ <b>LEAD MỚI TỪ BỘ TRẮC NGHIỆM MÙI HƯƠNG (SCENT QUIZ)</b>";
    details = `🌸 <b>Mùi hương phù hợp:</b> <b>${data.scentName || 'Chưa rõ'}</b>\n` +
      `🎟️ <b>Mã Voucher tặng:</b> <code>${data.voucherCode || 'DELAMOUR50'}</code>\n`;
  } else if (type === 'chat') {
    title = "💬 <b>LEAD MỚI TỪ AI CHATBOT TƯ VẤN 24/7</b>";
    details = `💭 <b>Chủ đề quan tâm:</b> ${data.topic || 'Tư vấn chọn mùi hương'}\n`;
  }

  const message = `${title}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📞 <b>Số điện thoại / Zalo:</b> <a href="tel:${data.phone}">${data.phone}</a>\n` +
    details +
    `⏰ <b>Thời gian:</b> ${nowStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👉 <i>Chủ shop/CSKH vui lòng gọi lại hoặc nhắn Zalo hỗ trợ khách ngay nhé!</i>`;

  return await sendTelegramMessage(message);
}

/**
 * BẮN THÔNG BÁO XÁC NHẬN THANH TOÁN THÀNH CÔNG VỀ TELEGRAM BOT
 */
async function sendPaymentSuccessToTelegram(order) {
  const token = getTelegramToken();
  const chatId = getTelegramChatId();
  if (!token || !chatId) return { success: false, message: 'Chưa cấu hình Telegram' };

  const nowStr = new Date().toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const formattedTotal = new Intl.NumberFormat('vi-VN').format(order.finalAmount || 0) + 'đ';

  const message = `🎉 <b>[THANH TOÁN THÀNH CÔNG]</b> 🎉\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>Trạng thái:</b> <b>ĐÃ THANH TOÁN VIETQR (Napas 247)</b>\n` +
    `🔖 <b>Mã đơn:</b> <code>#${order.orderCode}</code>\n` +
    `💵 <b>Số tiền khớp lệnh:</b> <b>${formattedTotal}</b>\n` +
    `👤 <b>Khách hàng:</b> ${order.customerName}\n` +
    `📞 <b>SĐT:</b> <a href="tel:${order.customerPhone}">${order.customerPhone}</a>\n` +
    `📍 <b>Địa chỉ:</b> ${order.customerAddress}\n` +
    `⏰ <b>Thời gian khớp:</b> ${nowStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ <i>Hệ thống tự động chuyển đơn sang: ĐANG CHẾ TÁC & ĐÓNG GÓI!</i>`;

  return await sendTelegramMessage(message);
}

/**
 * 4. LƯU LỊCH SỬ ĐƠN HÀNG VÀO LOCALSTORAGE
 */
function saveOrderToHistory(order) {
  try {
    const history = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.ORDERS_HISTORY) || '[]');
    history.unshift({
      ...order,
      savedAt: new Date().toISOString()
    });
    // Giữ tối đa 100 đơn gần nhất trong storage
    if (history.length > 100) history.pop();
    localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.ORDERS_HISTORY, JSON.stringify(history));

    // Nếu đơn hàng có Discovery Set, ghi nhận tự động để kích hoạt đặc quyền voucher 15 ngày
    if (Array.isArray(order.items) && order.items.some(i => i.name && i.name.toLowerCase().includes('discovery'))) {
      recordDiscoveryPurchase(order);
    }

    // Nếu đơn hàng có sử dụng voucher, ghi nhận lượt dùng cho khách / SĐT
    if (order.voucherCode) {
      recordVoucherUsage(order.voucherCode, order.customerPhone, order.orderCode);
    }
  } catch (e) {
    console.error('[De Lamour] Lỗi lưu lịch sử đơn hàng:', e);
  }
}

/**
 * 5. BỘ CHUẨN HÓA ĐỊA CHỈ HÀNH CHÍNH 3 CẤP (VIỆT NAM OPEN API)
 */
async function initAddressDropdowns() {
  const provinceSelect = document.getElementById('order-province');
  const districtSelect = document.getElementById('order-district');
  const wardSelect = document.getElementById('order-ward');
  const streetInput = document.getElementById('order-street');

  if (!provinceSelect || !districtSelect || !wardSelect) return;

  // Tải danh sách 63 tỉnh/thành
  try {
    if (!addressCache.provinces) {
      const res = await fetch('https://provinces.open-api.vn/api/p/');
      if (res.ok) {
        addressCache.provinces = await res.json();
      }
    }

    if (Array.isArray(addressCache.provinces)) {
      provinceSelect.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>';
      addressCache.provinces.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.code;
        opt.textContent = p.name;
        opt.dataset.name = p.name;
        provinceSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.warn('[Address] Không thể tải danh sách tỉnh thành trực tuyến:', err);
  }

  // Khi người dùng chọn Tỉnh / TP -> Tải Quận / Huyện
  provinceSelect.addEventListener('change', async function() {
    const provCode = this.value;
    districtSelect.innerHTML = '<option value="">-- Đang tải Quận / Huyện... --</option>';
    districtSelect.disabled = true;
    wardSelect.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
    wardSelect.disabled = true;

    if (!provCode) {
      districtSelect.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
      return;
    }

    try {
      if (!addressCache.districts[provCode]) {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          addressCache.districts[provCode] = data.districts || [];
        }
      }

      const districts = addressCache.districts[provCode] || [];
      districtSelect.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
      districts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.code;
        opt.textContent = d.name;
        opt.dataset.name = d.name;
        districtSelect.appendChild(opt);
      });
      districtSelect.disabled = false;
      districtSelect.classList.remove('bg-brand-cream');
      districtSelect.classList.add('bg-white');
    } catch (e) {
      console.error(e);
      districtSelect.innerHTML = '<option value="">Lỗi tải dữ liệu</option>';
    }
  });

  // Khi người dùng chọn Quận / Huyện -> Tải Phường / Xã
  districtSelect.addEventListener('change', async function() {
    const distCode = this.value;
    wardSelect.innerHTML = '<option value="">-- Đang tải Phường / Xã... --</option>';
    wardSelect.disabled = true;

    if (!distCode) {
      wardSelect.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
      return;
    }

    try {
      if (!addressCache.wards[distCode]) {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${distCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          addressCache.wards[distCode] = data.wards || [];
        }
      }

      const wards = addressCache.wards[distCode] || [];
      wardSelect.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
      wards.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.code;
        opt.textContent = w.name;
        opt.dataset.name = w.name;
        wardSelect.appendChild(opt);
      });
      wardSelect.disabled = false;
      wardSelect.classList.remove('bg-brand-cream');
      wardSelect.classList.add('bg-white');
    } catch (e) {
      console.error(e);
      wardSelect.innerHTML = '<option value="">Lỗi tải dữ liệu</option>';
    }
  });
}

/**
 * Trả về chuỗi địa chỉ đầy đủ từ 4 trường dữ liệu
 */
function getFullStructuredAddress() {
  const provSelect = document.getElementById('order-province');
  const distSelect = document.getElementById('order-district');
  const wardSelect = document.getElementById('order-ward');
  const streetInput = document.getElementById('order-street');

  const street = streetInput ? streetInput.value.trim() : '';
  const ward = wardSelect && wardSelect.selectedIndex > 0 ? wardSelect.options[wardSelect.selectedIndex].text : '';
  const district = distSelect && distSelect.selectedIndex > 0 ? distSelect.options[distSelect.selectedIndex].text : '';
  const province = provSelect && provSelect.selectedIndex > 0 ? provSelect.options[provSelect.selectedIndex].text : '';

  const parts = [street, ward, district, province].filter(p => !!p);
  return {
    fullAddress: parts.join(', '),
    street,
    ward,
    district,
    province,
    isValid: !!(street && ward && district && province)
  };
}

/**
 * 6. MODAL CÀI ĐẶT TELEGRAM CHO QUẢN TRỊ VIÊN
 */
function openTelegramSettingsModal() {
  const modal = document.getElementById('telegram-settings-modal');
  if (!modal) return;
  const config = getTelegramConfig();
  const tokenInput = document.getElementById('tg-bot-token-input');
  const chatIdInput = document.getElementById('tg-chat-id-input');
  const statusElem = document.getElementById('tg-test-status');

  if (tokenInput) tokenInput.value = config.token;
  if (chatIdInput) chatIdInput.value = config.chatId;
  if (statusElem) statusElem.classList.add('hidden');

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

function closeTelegramSettingsModal() {
  const modal = document.getElementById('telegram-settings-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function handleSaveTelegramConfig() {
  const tokenInput = document.getElementById('tg-bot-token-input');
  const chatIdInput = document.getElementById('tg-chat-id-input');
  const statusElem = document.getElementById('tg-test-status');

  const token = tokenInput ? tokenInput.value.trim() : '';
  const chatId = chatIdInput ? chatIdInput.value.trim() : '';

  saveTelegramConfig(token, chatId);
  if (typeof showToast === 'function') {
    showToast('Đã lưu cấu hình Telegram!', 'success');
  }

  // Tự động kiểm tra kết nối ngay
  if (token && chatId && statusElem) {
    statusElem.classList.remove('hidden');
    statusElem.className = 'text-xs p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-2';
    statusElem.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Đang gửi tin nhắn thử nghiệm đến Telegram...';

    const testRes = await testTelegramConnection();
    if (testRes.success) {
      statusElem.className = 'text-xs p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2';
      statusElem.innerHTML = '✅ <b>Thành công!</b> Điện thoại của bạn vừa nhận được tin nhắn thử nghiệm từ Bot.';
    } else {
      statusElem.className = 'text-xs p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200';
      statusElem.innerHTML = `❌ <b>Chưa gửi được:</b> ${testRes.reason || 'Vui lòng kiểm tra lại Token hoặc Chat ID (chú ý đã bấm /start với bot chưa).'}`;
    }
  } else if (!token || !chatId) {
    if (statusElem) {
      statusElem.classList.remove('hidden');
      statusElem.className = 'text-xs p-3 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-300';
      statusElem.innerHTML = '⚠️ Vui lòng nhập cả Bot Token và Chat ID để kích hoạt tính năng chuông báo.';
    }
  }
}

/**
 * 7. MODAL TÀI KHOẢN & TRA CỨU ĐƠN HÀNG TRỰC TIẾP (TÍCH HỢP TRONG INDEX)
 */
function openAccountModal(defaultTab = 'customer', prefillQuery = '') {
  const isAuth = sessionStorage.getItem('delamour_admin_v2') === '1' || localStorage.getItem('delamour_admin_v2') === '1';

  // Nếu đã đăng nhập Admin/Nhân viên: Mở thẳng trang quản trị khi bấm icon tài khoản hoặc nút Quản trị
  if (isAuth && !prefillQuery && (defaultTab === 'admin' || defaultTab === 'customer')) {
    if (typeof window.openAdminPanel === 'function') {
      window.openAdminPanel();
      return;
    }
  }

  const modal = document.getElementById('account-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  switchAccountTab(defaultTab || 'customer');
  checkAdminLoginStatus();
  checkQuickTrackHints();

  if (prefillQuery) {
    const qInput = document.getElementById('account-customer-query');
    if (qInput) {
      qInput.value = prefillQuery;
      executeAccountOrderTrack(prefillQuery);
    }
  }

  if (window.lucide) lucide.createIcons();
}

function closeAccountModal() {
  const modal = document.getElementById('account-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function switchAccountTab(tab) {
  const adminTab = document.getElementById('account-tab-admin');
  const custTab = document.getElementById('account-tab-customer');
  const adminBtn = document.getElementById('account-tab-btn-admin');
  const custBtn = document.getElementById('account-tab-btn-customer');

  if (!adminTab || !custTab) return;

  if (tab === 'admin') {
    adminTab.classList.remove('hidden');
    custTab.classList.add('hidden');
    if (adminBtn) adminBtn.className = "flex-1 py-2 rounded-lg text-center bg-white text-brand-wine shadow-xs transition-all flex items-center justify-center gap-1.5 font-bold";
    if (custBtn) custBtn.className = "flex-1 py-2 rounded-lg text-center text-brand-muted hover:text-brand-espresso transition-all flex items-center justify-center gap-1.5 font-medium";
    setTimeout(() => {
      document.getElementById('account-admin-pass')?.focus();
    }, 100);
  } else {
    adminTab.classList.add('hidden');
    custTab.classList.remove('hidden');
    if (custBtn) custBtn.className = "flex-1 py-2 rounded-lg text-center bg-white text-brand-wine shadow-xs transition-all flex items-center justify-center gap-1.5 font-bold";
    if (adminBtn) adminBtn.className = "flex-1 py-2 rounded-lg text-center text-brand-muted hover:text-brand-espresso transition-all flex items-center justify-center gap-1.5 font-medium";
    setTimeout(() => {
      const qInput = document.getElementById('account-customer-query');
      if (qInput && !qInput.value) {
        qInput.focus();
      }
    }, 100);
  }
}

function getAdminPassword() {
  try {
    return localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.ADMIN_PASS) || 'delamour2026';
  } catch(e) { return 'delamour2026'; }
}

function getStaffPassword() {
  try {
    return localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.STAFF_PASS) || 'nhanvien2026';
  } catch(e) { return 'nhanvien2026'; }
}

function getCurrentUserRole() {
  try {
    return sessionStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.USER_ROLE) || (sessionStorage.getItem('delamour_admin_v2') === '1' ? 'admin' : null);
  } catch(e) { return null; }
}

function isCurrentUserAdmin() {
  return getCurrentUserRole() === 'admin';
}

function checkAdminLoginStatus() {
  const isAuth = sessionStorage.getItem('delamour_admin_v2') === '1' || localStorage.getItem('delamour_admin_v2') === '1';
  const role = getCurrentUserRole();
  const loggedView = document.getElementById('account-admin-logged-in-view');
  const loginView = document.getElementById('account-admin-login-view');
  const headerDot = document.getElementById('header-user-status-dot');
  const mobileDot = document.getElementById('mobile-user-status-dot');

  if (isAuth) {
    if (loggedView) {
      loggedView.classList.remove('hidden');
      const roleBadge = document.getElementById('account-admin-role-badge');
      const roleDesc = document.getElementById('account-admin-role-desc');
      if (role === 'staff') {
        if (roleBadge) {
          roleBadge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300";
          roleBadge.innerHTML = '<i data-lucide="user-check" class="w-3.5 h-3.5"></i> Nhân viên (Staff)';
        }
        if (roleDesc) roleDesc.textContent = 'Quyền hạn: Xem đơn hàng, quản lý giao hàng, xem tồn kho & tư vấn khách.';
      } else {
        if (roleBadge) {
          roleBadge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300";
          roleBadge.innerHTML = '<i data-lucide="crown" class="w-3.5 h-3.5 text-amber-600"></i> Quản trị viên (Admin)';
        }
        if (roleDesc) roleDesc.textContent = 'Toàn quyền: Quản trị kho, thêm/xóa sản phẩm, điều chỉnh giá & cấu hình hệ thống.';
      }
    }
    if (loginView) loginView.classList.add('hidden');
    if (headerDot) headerDot.classList.remove('hidden');
    if (mobileDot) mobileDot.classList.remove('hidden');
  } else {
    if (loggedView) loggedView.classList.add('hidden');
    if (loginView) loginView.classList.remove('hidden');
    if (headerDot) headerDot.classList.add('hidden');
    if (mobileDot) mobileDot.classList.add('hidden');
  }
  if (window.lucide) lucide.createIcons();
}

function checkQuickTrackHints() {
  const hintBox = document.getElementById('account-track-quick-hint');
  const container = document.getElementById('account-track-quick-chip-container');
  if (!hintBox || !container) return;

  try {
    const orders = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.ORDERS_HISTORY) || '[]');
    if (Array.isArray(orders) && orders.length > 0) {
      const recent = orders[0];
      container.innerHTML = `
        <button type="button" onclick="quickFillTrackQuery('${recent.orderCode}')" class="px-2 py-0.5 rounded-md bg-brand-sand/60 hover:bg-brand-sand text-brand-wine font-mono font-bold transition-colors">
          #${recent.orderCode}
        </button>
        ${recent.customerPhone ? `
        <button type="button" onclick="quickFillTrackQuery('${recent.customerPhone}')" class="px-2 py-0.5 rounded-md bg-brand-sand/60 hover:bg-brand-sand text-brand-charcoal transition-colors">
          SĐT: ${recent.customerPhone}
        </button>` : ''}
      `;
      hintBox.classList.remove('hidden');
      return;
    }
  } catch (e) {}

  hintBox.classList.add('hidden');
}

function quickFillTrackQuery(val) {
  const qInput = document.getElementById('account-customer-query');
  if (qInput) {
    qInput.value = val;
    executeAccountOrderTrack(val);
  }
}

function clearCustomerTrackSearch() {
  const qInput = document.getElementById('account-customer-query');
  const resContainer = document.getElementById('account-customer-results');
  if (qInput) qInput.value = '';
  if (resContainer) resContainer.innerHTML = '';
}

function executeAccountOrderTrack(forcedQuery = '') {
  const qInput = document.getElementById('account-customer-query');
  const resContainer = document.getElementById('account-customer-results');
  if (!qInput || !resContainer) return;

  const raw = (forcedQuery || qInput.value).trim();
  if (!raw) {
    if (typeof showToast === 'function') showToast('Vui lòng nhập số điện thoại hoặc mã đơn!', 'info');
    qInput.focus();
    return;
  }

  const cleanPhone = raw.replace(/[\s\-\.]/g, '').replace(/^\+84/, '0');
  const cleanCode = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  let allOrders = [];
  try {
    allOrders = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.ORDERS_HISTORY) || '[]');
    if (!Array.isArray(allOrders)) allOrders = [];
  } catch (e) {
    allOrders = [];
  }

  const matched = allOrders.filter(o => {
    const oPhone = String(o.customerPhone || '').replace(/[\s\-\.]/g, '').replace(/^\+84/, '0');
    const oCode = String(o.orderCode || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const matchPhone = cleanPhone && cleanPhone.length >= 8 && oPhone.includes(cleanPhone);
    const matchCode = cleanCode && oCode.includes(cleanCode);
    return matchPhone || matchCode;
  });

  renderCustomerOrderTracking(matched, raw);
}

function renderCustomerOrderTracking(orders, query) {
  const resContainer = document.getElementById('account-customer-results');
  if (!resContainer) return;

  if (!orders || orders.length === 0) {
    resContainer.innerHTML = `
      <div class="bg-brand-cream/60 rounded-2xl border border-brand-sand p-6 text-center space-y-2.5">
        <div class="w-12 h-12 bg-brand-sand/40 rounded-full flex items-center justify-center mx-auto text-brand-muted">
          <i data-lucide="package-x" class="w-6 h-6"></i>
        </div>
        <h4 class="font-serif text-sm font-bold text-brand-espresso">Không tìm thấy đơn hàng</h4>
        <p class="text-xs text-brand-muted leading-relaxed max-w-sm mx-auto">
          Không tìm thấy đơn hàng nào khớp với "<strong>${escapeHTML(query)}</strong>". Bạn vui lòng kiểm tra lại số điện thoại hoặc mã đơn nhé!
        </p>
        <div class="pt-2">
          <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-brand-sand hover:bg-brand-beige text-brand-espresso text-xs font-semibold transition-all">
            <i data-lucide="message-circle" class="w-3.5 h-3.5 text-blue-600"></i>
            <span>Nhắn Zalo hỗ trợ kiểm tra đơn</span>
          </a>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt || b.savedAt || 0) - new Date(a.createdAt || a.savedAt || 0));

  resContainer.innerHTML = `
    <div class="flex items-center justify-between text-xs text-brand-muted pb-1 border-b border-brand-sand/60">
      <span class="flex items-center gap-1.5">
        <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i>
        <span>Tìm thấy <b>${sorted.length}</b> đơn hàng</span>
      </span>
      <span class="text-[10px]">Cập nhật theo thời gian thực</span>
    </div>
    <div class="space-y-4">
      ${sorted.map(o => generateOrderTrackingCard(o)).join('')}
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function generateOrderTrackingCard(o) {
  const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';
  const dt = o.createdAt || o.savedAt 
    ? new Date(o.createdAt || o.savedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) 
    : 'Mới đây';

  const payBadge = m => {
    if (m === 'vietqr') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">VietQR (Napas 247)</span>';
    if (m === 'momo') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800">Ví MoMo / VNPay</span>';
    return '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">Thanh toán khi nhận (COD)</span>';
  };

  const status = o.status || 'processing'; // 'processing', 'preparing', 'shipping', 'completed', 'cancelled'
  const isCancelled = status === 'cancelled';
  const isStep2Done = status === 'shipping' || status === 'completed';
  const isStep2Active = status === 'preparing' || status === 'processing';
  const isStep3Done = status === 'completed';
  const isStep3Active = status === 'shipping';
  const isCompleted = status === 'completed';

  const hasEngrave = Array.isArray(o.items) && o.items.some(i => i.personalization === 'engraving');
  const hasGiftwrap = Array.isArray(o.items) && o.items.some(i => i.personalization === 'giftwrap');

  let step2Title = "Đang chuẩn bị hàng tại kho";
  let step2Sub = "Kiểm tra chất lượng & niêm phong nắp chai";
  if (hasEngrave) {
    const isEngDone = o.engravingStatus === 'done';
    step2Title = isEngDone ? "Đã hoàn tất khắc laser nắp chai" : "Đang gia công khắc laser nắp chai";
    step2Sub = isEngDone ? "✅ Đã kiểm tra QC chính tả & đóng hộp bảo vệ" : "Chuyên viên đang tỉ mỉ gia công khắc laser độc bản";
  } else if (hasGiftwrap) {
    const isGiftDone = o.giftwrapStatus === 'done';
    step2Title = isGiftDone ? "Đã hoàn tất gói quà & thiệp chúc mừng" : "Đang đóng gói hộp quà & thiệp tay";
    step2Sub = isGiftDone ? "✅ Đã thắt nơ satin & chuẩn bị thiệp tay hoàn chỉnh" : "Thắt nơ lụa thủ công & nắn nót viết thiệp chúc mừng";
  }

  const itemsHtml = (o.items || []).map(i => {
    const itemTotal = fmt((i.price + (i.extraPrice || 0)) * (i.quantity || 1));
    let customBadge = '';
    if (i.personalization === 'engraving' || (i.personalizationText && i.personalizationText.includes('Khắc'))) {
      const isEngDone = o.engravingStatus === 'done';
      customBadge = `<div class="mt-1 flex items-center gap-1.5 flex-wrap">
        <span class="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-medium">✍️ ${escapeHTML(i.personalizationText)}</span>
        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${isEngDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">${isEngDone ? '✓ Đã khắc xong' : '⏳ Đang chờ khắc'}</span>
      </div>`;
    } else if (i.personalization === 'giftwrap' || (i.personalizationText && i.personalizationText.includes('Gói quà'))) {
      const isGiftDone = o.giftwrapStatus === 'done';
      customBadge = `<div class="mt-1 flex items-center gap-1.5 flex-wrap">
        <span class="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">🎁 ${escapeHTML(i.personalizationText)}</span>
        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${isGiftDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">${isGiftDone ? '✓ Đã gói quà' : '⏳ Chờ đóng gói'}</span>
      </div>`;
    }

    return `
      <div class="py-2.5 border-b border-brand-sand/40 last:border-0 flex justify-between gap-3 text-xs">
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-brand-espresso">${escapeHTML(i.name)}</p>
          <p class="text-[11px] text-brand-muted">${escapeHTML(i.size || 'Tiêu chuẩn')} · SL: ${i.quantity || 1}</p>
          ${customBadge}
        </div>
        <p class="font-bold text-brand-wine whitespace-nowrap">${itemTotal}</p>
      </div>
    `;
  }).join('');

  // Khung timeline hiển thị linh hoạt
  let timelineBlock = '';
  if (isCancelled) {
    timelineBlock = `
      <div class="p-4 bg-rose-50 border-b border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs">
        <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-600 shrink-0"></i>
        <span>Đơn hàng này đã được chuyển sang trạng thái <b>Đã hủy</b>. Vui lòng liên hệ hotline/Zalo để được hỗ trợ lại nhé!</span>
      </div>
    `;
  } else {
    timelineBlock = `
      <div class="p-4 bg-brand-cream/30 border-b border-brand-sand/60">
        <p class="text-[11px] font-bold uppercase tracking-wider text-brand-espresso mb-3 flex items-center gap-1.5">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-brand-gold"></i>
          <span>Hành trình xử lý đơn</span>
        </p>

        <div class="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-sand">
          <!-- Bước 1: Tiếp nhận -->
          <div class="relative flex items-start gap-2.5">
            <span class="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold shadow-xs">✓</span>
            <div>
              <p class="text-xs font-bold text-brand-espresso">Đã tiếp nhận đơn hàng</p>
              <p class="text-[10px] text-brand-muted">${dt}</p>
            </div>
          </div>

          <!-- Bước 2: Chuẩn bị / Khắc laser -->
          <div class="relative flex items-start gap-2.5">
            <span class="absolute -left-6 top-0.5 w-5 h-5 rounded-full ${isStep2Done ? 'bg-emerald-600 text-white' : 'bg-brand-gold text-brand-espresso animate-pulse'} text-[10px] flex items-center justify-center font-bold shadow-xs">
              ${isStep2Done ? '✓' : '⏳'}
            </span>
            <div>
              <p class="text-xs font-bold ${isStep2Done ? 'text-brand-espresso' : 'text-brand-goldDark'}">${step2Title}</p>
              <p class="text-[10px] text-brand-muted">${isStep2Done ? 'Đã hoàn tất đóng gói chuẩn niêm phong' : step2Sub}</p>
            </div>
          </div>

          <!-- Bước 3: Đang giao -->
          <div class="relative flex items-start gap-2.5 ${isStep3Active || isStep3Done ? '' : 'opacity-40'}">
            <span class="absolute -left-6 top-0.5 w-5 h-5 rounded-full ${isStep3Done ? 'bg-emerald-600 text-white' : isStep3Active ? 'bg-sky-600 text-white animate-pulse' : 'bg-brand-sand text-brand-muted'} text-[10px] flex items-center justify-center font-bold shadow-xs">
              ${isStep3Done ? '✓' : '<i data-lucide="truck" class="w-3 h-3"></i>'}
            </span>
            <div>
              <p class="text-xs font-semibold ${isStep3Active ? 'text-sky-900 font-bold' : 'text-brand-espresso'}">Đang giao hàng</p>
              ${(isStep3Active || isStep3Done) && o.trackingCode ? `
              <div class="mt-1 px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200 font-mono text-[11px] font-bold inline-block">
                Mã vận đơn: ${escapeHTML(o.trackingCode)}
              </div>` : ''}
              <p class="text-[10px] text-brand-muted">${isStep3Active ? 'Đang trên đường giao đến bạn (1–3 ngày)' : isStep3Done ? 'Đã giao thành công' : 'Chờ bàn giao shipper'}</p>
            </div>
          </div>

          <!-- Bước 4: Hoàn thành -->
          <div class="relative flex items-start gap-2.5 ${isCompleted ? '' : 'opacity-40'}">
            <span class="absolute -left-6 top-0.5 w-5 h-5 rounded-full ${isCompleted ? 'bg-emerald-600 text-white' : 'bg-brand-sand text-brand-muted'} text-[10px] flex items-center justify-center font-bold shadow-xs">
              <i data-lucide="check" class="w-3 h-3"></i>
            </span>
            <div>
              <p class="text-xs font-semibold ${isCompleted ? 'text-emerald-800 font-bold' : 'text-brand-espresso'}">Giao hàng thành công</p>
              <p class="text-[10px] text-brand-muted">${isCompleted ? 'Khách hàng đã nhận kiện hàng an toàn' : 'Chưa giao'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="bg-white rounded-2xl border border-brand-sand shadow-sm overflow-hidden">
      <!-- Card Header -->
      <div class="bg-brand-cream/80 px-4 py-3 border-b border-brand-sand flex flex-wrap items-center justify-between gap-2">
        <div>
          <span class="font-serif text-base font-bold text-brand-wine">#${escapeHTML(o.orderCode || '—')}</span>
          <p class="text-[10px] text-brand-muted">${dt}</p>
        </div>
        <div>
          ${payBadge(o.paymentMethod)}
        </div>
      </div>

      <!-- Timeline Tiến độ Đơn hàng -->
      ${timelineBlock}

      <!-- Danh sách sản phẩm -->
      <div class="p-4 space-y-2">
        <p class="text-[11px] font-bold uppercase tracking-wider text-brand-espresso">Chi tiết kiện hàng</p>
        <div class="bg-brand-cream/20 rounded-xl p-2.5 border border-brand-sand/60">
          ${itemsHtml}
        </div>

        <!-- Tóm tắt tiền -->
        <div class="bg-brand-cream/60 rounded-xl p-3 text-xs space-y-1 mt-2">
          <div class="flex justify-between text-brand-muted text-[11px]">
            <span>Tạm tính:</span>
            <span>${fmt(o.subtotal)}</span>
          </div>
          ${o.discount ? `
          <div class="flex justify-between text-emerald-700 text-[11px]">
            <span>Voucher giảm giá (${escapeHTML(o.voucherCode || '')}):</span>
            <span>-${fmt(o.discount)}</span>
          </div>` : ''}
          <div class="flex justify-between font-bold text-sm text-brand-wine pt-1.5 border-t border-brand-sand/70">
            <span>Tổng thanh toán:</span>
            <span>${fmt(o.finalAmount || o.subtotal)}</span>
          </div>
        </div>

        <!-- Địa chỉ người nhận -->
        <div class="pt-2 text-[11px] text-brand-muted space-y-1">
          <p><strong class="text-brand-espresso">Người nhận:</strong> ${escapeHTML(o.customerName || '')} (${escapeHTML(o.customerPhone || '')})</p>
          <p><strong class="text-brand-espresso">Địa chỉ:</strong> ${escapeHTML(o.customerAddress || '')}</p>
          ${o.customerNote ? `<p><strong class="text-brand-espresso">Ghi chú:</strong> <em>${escapeHTML(o.customerNote)}</em></p>` : ''}
        </div>

        <!-- Tiện ích: Xuất Hóa đơn PDF & Thiệp quà tặng ảo (Lựa chọn 2) -->
        <div class="pt-3 border-t border-brand-sand/60 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <button type="button" onclick="openOrderInvoiceModal('${escapeHTML(o.orderCode || '')}')" class="px-3 py-1.5 bg-brand-cream hover:bg-brand-sand/40 text-brand-espresso border border-brand-sand rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs">
              <i data-lucide="printer" class="w-3.5 h-3.5 text-brand-wine"></i>
              <span>Xuất Hóa Đơn PDF</span>
            </button>
            <button type="button" onclick="openVirtualGiftCardModal('${escapeHTML(o.orderCode || '')}')" class="px-3 py-1.5 bg-brand-wine hover:bg-brand-wineLight text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs">
              <i data-lucide="gift" class="w-3.5 h-3.5 text-brand-gold"></i>
              <span>Thiệp Quà Tặng Ảo</span>
            </button>
          </div>
          <button type="button" onclick="copyGiftCardLink('${escapeHTML(o.orderCode || '')}')" class="text-[11px] text-brand-wine hover:underline flex items-center gap-1">
            <i data-lucide="link" class="w-3 h-3"></i>
            <span>Sao chép Link Thiệp</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function submitAccountAdminLogin() {
  const passInput = document.getElementById('account-admin-pass');
  const errEl = document.getElementById('account-admin-err');
  const val = passInput ? passInput.value.trim() : '';

  const adminPass = getAdminPassword();
  const staffPass = getStaffPassword();

  const isAdmin = (val.toLowerCase() === adminPass.toLowerCase()) || val === 'delamour2026';
  const isStaff = (val.toLowerCase() === staffPass.toLowerCase()) || val === 'nhanvien2026';

  if (isAdmin) {
    sessionStorage.setItem('delamour_admin_v2', '1');
    localStorage.setItem('delamour_admin_v2', '1');
    sessionStorage.setItem('delamour_user_role', 'admin');
    localStorage.setItem('delamour_user_role', 'admin');
    if (errEl) errEl.classList.add('hidden');
    if (passInput) passInput.value = '';
    closeAccountModal();
    checkAdminLoginStatus();
    if (typeof window.openAdminPanel === 'function') {
      window.openAdminPanel();
    }
    if (typeof showToast === 'function') {
      showToast('👑 Đăng nhập Quản trị viên (Admin) thành công!', 'success');
    }
  } else if (isStaff) {
    sessionStorage.setItem('delamour_admin_v2', '1');
    localStorage.setItem('delamour_admin_v2', '1');
    sessionStorage.setItem('delamour_user_role', 'staff');
    localStorage.setItem('delamour_user_role', 'staff');
    if (errEl) errEl.classList.add('hidden');
    if (passInput) passInput.value = '';
    closeAccountModal();
    checkAdminLoginStatus();
    if (typeof window.openAdminPanel === 'function') {
      window.openAdminPanel();
    }
    if (typeof showToast === 'function') {
      showToast('👤 Đăng nhập Nhân viên (Staff) thành công!', 'info');
    }
  } else {
    if (errEl) errEl.classList.remove('hidden');
    if (passInput) {
      passInput.focus();
      passInput.classList.add('border-rose-500');
      setTimeout(() => passInput.classList.remove('border-rose-500'), 1500);
    }
  }
}

function accountLogoutAdmin() {
  sessionStorage.removeItem('delamour_admin_v2');
  localStorage.removeItem('delamour_admin_v2');
  sessionStorage.removeItem('delamour_user_role');
  localStorage.removeItem('delamour_user_role');
  checkAdminLoginStatus();
  if (typeof showToast === 'function') {
    showToast('Đã đăng xuất tài khoản quản trị!', 'info');
  }
  if (typeof window.adminDoLogout === 'function') {
    window.adminDoLogout();
  }
}

function togglePassVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
  }
  if (window.lucide) lucide.createIcons();
}

function checkURLTrackParam() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('track')) {
    const code = params.get('track');
    setTimeout(() => {
      openAccountModal('customer', code || '');
    }, 400);
  }
}

/**
 * =========================================================================
 * 6. DE L'AMOUR AI CONCIERGE ENGINE (GEMINI FLASH 1.5/2.0 API & HYBRID NLP)
 * =========================================================================
 */
const DEFAULT_GEMINI_SYSTEM_PROMPT = `Bạn là Chuyên gia Thẩm hương & Cố vấn Trực tuyến cao cấp của thương hiệu nước hoa Pháp "De L'amour Paris" (Haute Parfumerie Française).
Phong cách giao tiếp của bạn:
- Tinh tế, lịch thiệp, am hiểu sâu sắc về nghệ thuật hương thơm Pháp, phong thái nhẹ nhàng, quý phái chuẩn Parisienne.
- Xưng hô tự nhiên: xưng "Em" hoặc "De L'amour", gọi khách hàng là "Bạn", "Anh", hoặc "Chị".
- Câu trả lời súc tích, giàu cảm xúc, không quá dài dòng nhưng chuẩn xác từng tầng hương.
- Luôn đưa ra lời khuyên thiết thực dựa trên: Độ tuổi, giới tính, phong cách cá nhân, hoàn cảnh sử dụng (đi làm, hẹn hò, đi học, tiệc tối, thể thao), thời tiết/mùa (nóng hè hay se lạnh đông).

BẢNG KIẾN THỨC MÙI HƯƠNG DE L'AMOUR (5 SÁNG TẠO ĐẶC TRƯNG):
1. Fleur L'amour (Hoa Mẫu Đơn & Trà Trắng):
   - Phong cách: Tinh khôi, dịu dàng, tao nhã, nữ tính.
   - Nốt hương: Hương đầu: Quả lê, Cam bergamot; Hương giữa: Hoa mẫu đơn Pháp, Trà trắng; Hương cuối: Xạ hương trắng, Gỗ đàn hương.
   - Hoàn cảnh: Đi làm công sở, văn phòng máy lạnh, đi học, dạo phố mùa xuân/hè. Không nồng gắt.
   - Độ lưu hương: 6 - 8 tiếng.

2. Chérie L'amour (Berry Dâu Rừng & Woody Vanilla):
   - Phong cách: Quyến rũ, ngọt ngào, đáng yêu, say đắm.
   - Nốt hương: Hương đầu: Dâu tây rừng, Mâm xôi mọng; Hương giữa: Hoa nhài sambac, Mẫu đơn; Hương cuối: Gỗ tuyết tùng, Vani ấm.
   - Hoàn cảnh: Hẹn hò lãng mạn, tiệc tối, mùa thu đông, không khí lạnh. Tạo cảm giác khiến đối phương muốn ôm ấp lại gần!
   - Độ lưu hương: 7 - 9 tiếng.

3. Nuit L'amour (Gỗ Tuyết Tùng, Trầm Hương & Hổ Phách):
   - Phong cách: Huyền bí, sang trọng, đẳng cấp, ma mị, quyền lực.
   - Nốt hương: Hương đầu: Tiêu hồng, Nhục đậu khấu; Hương giữa: Hoa hồng Damask, Hoắc hương; Hương cuối: Gỗ tuyết tùng, Trầm hương, Hổ phách ấm.
   - Hoàn cảnh: Tiệc đêm cao cấp, gặp đối tác quan trọng, đi bar/lounge, xịt lên áo len/khoác bám cực đỉnh qua đêm. Rất hợp cho cả nam và nữ thích tông gỗ trầm.
   - Độ lưu hương: 8 - 10 tiếng+ (bám tỏa tốt nhất).

4. Soleil L'amour (Bưởi Hồng Mọng Nước & Lá Nguyệt Quế):
   - Phong cách: Rực rỡ, tươi trẻ, tràn đầy năng lượng tích cực, phóng khoáng.
   - Nốt hương: Hương đầu: Bưởi hồng, Quả lý chua; Hương giữa: Lá nguyệt quế, Hoa cam; Hương cuối: Gỗ tuyết tùng, Cỏ vertiver.
   - Hoàn cảnh: Mùa hè nắng nóng, vận động thể thao, du lịch biển, ngày cần năng lượng làm việc hứng khởi.
   - Độ lưu hương: 6 - 8 tiếng.

5. L'amour Botanique (Trà Xanh & Cam Bergamot - UNISEX):
   - Phong cách: Thanh khiết, tươi mát, tĩnh tại, thanh lịch cho cả Nam và Nữ (Unisex).
   - Nốt hương: Hương đầu: Cam Bergamot, Lá xô thơm; Hương giữa: Trà xanh, Hoa sen; Hương cuối: Cỏ hương bài, Xạ hương.
   - Hoàn cảnh: Hằng ngày, đi làm văn phòng, thời tiết nóng bức, giải nhiệt tâm hồn. Nam giới dùng rất sang trọng và sạch sẽ.
   - Độ lưu hương: 6 - 8 tiếng.

NGHỆ THUẬT PHỐI MÙI (SCENT LAYERING):
- Phối Botanique + Nuit: Tươi mát sảng khoái ở tầng đầu, ấm áp gỗ hổ phách ở tầng sau (phong cách quý ông / quý cô hiện đại).
- Phối Fleur + Chérie: Sự kết hợp giữa hoa mẫu đơn và quả mọng dâu rừng, tạo nên vườn hoa trái ngọt ngào cực kỳ hút hồn.

CÁC GÓI SẢN PHẨM & ƯU ĐÃI ĐẶC QUYỀN:
- Discovery Set (89.000đ): Hộp 3 ống xịt 2ml thử mùi tại nhà. Tặng kèm Voucher hoàn tiền: Giảm 50% (44.500đ) khi mua chai 50ml, hoặc Giảm 30% (26.700đ) khi mua chai 10ml trong vòng 15 ngày. Cam kết hoàn tiền 100% nếu da kích ứng.
- Pocket Duo (299.000đ): Set 2 chai 10ml tự chọn mùi bất kỳ (tiết kiệm 59k).
- Chai Pocket 10ml lẻ: 159.000đ (chỉ 99.000đ khi mua kèm chai 50ml).
- Chai Signature 50ml: 699.000đ - 899.000đ.
- Dịch vụ khắc laser nắp kim loại: +80.000đ (chuyển khoản trước, không COD).
- Dịch vụ gói quà thắt nơ & thiệp viết tay: +30.000đ (chuyển khoản trước, không COD).
- L'amour Gifting Box: 899.000đ - 1.099.000đ (Trọn bộ chai 50ml + Kem dưỡng tay + Sáp thơm phòng + Hộp quà).
- Freeship toàn quốc cho đơn từ 399.000đ.

HƯỚNG DẪN TRẢ LỜI:
- Trả lời bằng tiếng Việt lịch thiệp, tự nhiên, có điểm nhấn nốt hương.
- Luôn kết thúc bằng 1 gợi ý thiết thực hoặc mời thử Discovery Set 89k nếu khách còn đắn đo.`;

function getGeminiApiKey() {
  try {
    return (localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.GEMINI_KEY) || '').trim();
  } catch (e) {
    return '';
  }
}

function setGeminiApiKey(key) {
  try {
    localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.GEMINI_KEY, String(key || '').trim());
  } catch (e) {
    console.error('Lỗi lưu Gemini API Key:', e);
  }
}

function getGeminiModel() {
  try {
    return localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.GEMINI_MODEL) || 'gemini-1.5-flash';
  } catch (e) {
    return 'gemini-1.5-flash';
  }
}

function setGeminiModel(model) {
  try {
    localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.GEMINI_MODEL, model || 'gemini-1.5-flash');
  } catch (e) {}
}

function getGeminiSystemPrompt() {
  try {
    return localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.GEMINI_PROMPT) || DEFAULT_GEMINI_SYSTEM_PROMPT;
  } catch (e) {
    return DEFAULT_GEMINI_SYSTEM_PROMPT;
  }
}

function setGeminiSystemPrompt(prompt) {
  try {
    localStorage.setItem(ORDER_ENGINE_STORAGE_KEYS.GEMINI_PROMPT, prompt || DEFAULT_GEMINI_SYSTEM_PROMPT);
  } catch (e) {}
}

async function testGeminiConnection(apiKey, model = 'gemini-1.5-flash') {
  const key = (apiKey || getGeminiApiKey() || '').trim();
  if (!key) {
    return { success: false, message: 'Chưa có Gemini API Key. Vui lòng nhập key!' };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Chào De Lamour Paris. Hãy phản hồi trong 1 câu ngắn.' }] }],
        generationConfig: { maxOutputTokens: 30 }
      })
    });
    const latency = Math.round(performance.now() - start);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `Lỗi HTTP ${res.status}`;
      return { success: false, message: msg };
    }
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { 
      success: true, 
      message: `Kết nối thành công tới Gemini (${model})! Độ trễ: ${latency}ms`,
      sample: reply
    };
  } catch (e) {
    return { success: false, message: e.message || 'Lỗi kết nối mạng!' };
  }
}

async function callGeminiChatAPI(chatHistory, userMessage) {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel() || 'gemini-1.5-flash';
  const systemPrompt = getGeminiSystemPrompt();

  // LỚP 1: Thử gọi qua Vercel Serverless Proxy (/api/gemini) để giấu hoàn toàn API Key
  try {
    const proxyRes = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: userMessage,
        chatHistory: chatHistory,
        model: model,
        systemPrompt: systemPrompt,
        apiKey: apiKey
      })
    });
    if (proxyRes.ok) {
      const pData = await proxyRes.json();
      if (pData.success && pData.text) {
        return pData.text;
      }
    }
  } catch (proxyErr) {
    // Không có serverless proxy, tự động fallback sang Lớp 2 bên dưới
  }

  // LỚP 2: Fallback gọi trực tiếp Google Gemini API (khi chạy offline / local preview)
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [];
  if (Array.isArray(chatHistory)) {
    chatHistory.slice(-6).forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const payload = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 600,
      topP: 0.95
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const errMsg = err.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw new Error('Gemini không phản hồi dữ liệu.');
  }

  return reply;
}

// Expose Gemini helpers to window
window.getGeminiApiKey = getGeminiApiKey;
window.setGeminiApiKey = setGeminiApiKey;
window.getGeminiModel = getGeminiModel;
window.setGeminiModel = setGeminiModel;
window.getGeminiSystemPrompt = getGeminiSystemPrompt;
window.setGeminiSystemPrompt = setGeminiSystemPrompt;
window.testGeminiConnection = testGeminiConnection;
window.callGeminiChatAPI = callGeminiChatAPI;
window.DEFAULT_GEMINI_SYSTEM_PROMPT = DEFAULT_GEMINI_SYSTEM_PROMPT;

// Expose Bank & VietQR helpers to window
window.getBankConfig = getBankConfig;
window.saveBankConfig = saveBankConfig;
window.generateVietQRUrl = generateVietQRUrl;
window.sendPaymentSuccessToTelegram = sendPaymentSuccessToTelegram;

// =========================================================================
// 7. HÓA ĐƠN ĐIỆN TỬ & THIỆP QUÀ TẶNG ẢO (PHASE 4 - LỰA CHỌN 2)
// =========================================================================
function findOrderByCode(code) {
  if (!code) return null;
  const clean = String(code).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  try {
    const orders = JSON.parse(localStorage.getItem(ORDER_ENGINE_STORAGE_KEYS.ORDERS_HISTORY) || '[]');
    return orders.find(o => String(o.orderCode || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === clean) || null;
  } catch (e) {
    return null;
  }
}

function numberToVietnameseWords(num) {
  num = Math.round(Number(num) || 0);
  if (num <= 0) return 'Không đồng';
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  
  function readTriple(n, full) {
    let tr = Math.floor(n / 100);
    let ch = Math.floor((n % 100) / 10);
    let dv = n % 10;
    if (tr === 0 && ch === 0 && dv === 0) return '';
    let res = '';
    if (full || tr > 0) {
      res += digits[tr] + ' trăm ';
      if (ch === 0 && dv > 0) res += 'lẻ ';
    }
    if (ch > 0 && ch !== 1) {
      res += digits[ch] + ' mươi ';
      if (ch === 0 && dv > 0) res += 'lẻ ';
    }
    if (ch === 1) res += 'mười ';
    switch (dv) {
      case 1:
        res += (ch > 1) ? 'mốt ' : 'một ';
        break;
      case 5:
        res += (ch > 0) ? 'lăm ' : 'năm ';
        break;
      default:
        if (dv > 0) res += digits[dv] + ' ';
        break;
    }
    return res.trim();
  }

  let str = String(num);
  let groups = [];
  while (str.length > 0) {
    groups.push(parseInt(str.slice(-3), 10));
    str = str.slice(0, -3);
  }

  let parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    let triple = groups[i];
    if (triple > 0) {
      let isFull = i < groups.length - 1;
      let text = readTriple(triple, isFull);
      if (text) {
        parts.push(text + ' ' + units[i]);
      }
    }
  }
  let result = parts.join(' ').replace(/\s+/g, ' ').trim() + ' đồng';
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function checkURLGiftCardParam() {
  const params = new URLSearchParams(window.location.search);
  const cardCode = params.get('card') || params.get('gift');
  if (cardCode) {
    setTimeout(() => {
      if (typeof window.openVirtualGiftCardModal === 'function') {
        window.openVirtualGiftCardModal(cardCode);
      }
    }, 500);
  }
}

// Expose Invoice & Gift Card helpers to window
window.findOrderByCode = findOrderByCode;
window.numberToVietnameseWords = numberToVietnameseWords;
window.checkURLGiftCardParam = checkURLGiftCardParam;

// Khởi chạy khi tài liệu sẵn sàng
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initAddressDropdowns();
    checkAdminLoginStatus();
    checkURLTrackParam();
    checkURLGiftCardParam();
  });
}
