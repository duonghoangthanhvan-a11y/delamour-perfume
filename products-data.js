/**
 * DE L'AMOUR PARIS - PRODUCTS DATABASE & SYNC MODULE
 * Tự động đồng bộ giữa index.html, product.html và admin.html
 */
const DEFAULT_PRODUCTS_DATA = {
  "cherie": {
    id: "cherie",
    name: "Chérie L'amour",
    subtitle: "Chérie L'amour • Berry & Woody Vanilla",
    badge: "Berry & Woody Vanilla",
    category: "sweet",
    categoryText: "Nhóm: Berry & Woody Vanilla",
    quote: "\"Một thoáng kiêu kỳ như đóa hoa nở muộn giữa lòng Paris – ngọt dịu quả mọng, ấm êm vani gỗ và vấn vương suốt ngày dài.\"",
    price10ml: 179000,
    price50ml: 679000,
    original10ml: "249.000đ",
    savingsText10ml: "Tiết kiệm 70k",
    original50ml: "799.000đ",
    savingsText50ml: "Tiết kiệm 120k",
    savingsText: "Tiết kiệm 120k",
    stock10ml: 45,
    stock50ml: 28,
    hidden: false,
    hidden10ml: false,
    hidden50ml: false,
    image: "cherie-lamour.webp",
    image50ml: "cherie-lamour.webp",
    image10ml: "cherie-pocket.webp",
    carouselImages: [
      { src: "cherie-1.webp", label: "Ảnh 1: Ảnh bìa / Cover" },
      { src: "cherie-2.webp", label: "Ảnh 2: Infographic Tầng Hương" },
      { src: "cherie-3.webp", label: "Ảnh 3: So sánh / Proof" },
      { src: "cherie-4.webp", label: "Ảnh 4: Hướng dẫn dùng Voucher" },
      { src: "cherie-5.webp", label: "Ảnh 5: Cam kết / Policy" }
    ],
    topNotes: "Quả mọng đỏ, Quả sung ngọt, Cam Bergamot",
    topDesc: "Mở đầu ngọt mọng, quyến rũ và ấn tượng khó phai.",
    heartNotes: "Hoa hồng Damask, Diên vĩ (Iris Powdery)",
    heartDesc: "Trái tim kiêu kỳ, phấn thơm mịn như lụa là trên da.",
    baseNotes: "Vani gỗ nguyên chất, Gỗ đàn hương, Xạ hương trắng",
    baseDesc: "Lưu lại chiều sâu ấm áp, sang trọng và kiêu sa.",
    longevity: "7 – 9 tiếng",
    longevityPercent: "85%",
    longevityDesc: "Lưu hương tốt trên da và vải áo",
    sillage: "1 cánh tay (Vừa phải)",
    sillagePercent: "70%",
    sillageDesc: "Dịu dàng, không gây gắt nơi văn phòng",
    occasions: ["Hẹn hò lãng mạn", "Công sở", "Tiệc tối"],
    occasionsDesc: "Tỏa sáng trong những buổi hẹn hò lãng mạn hoặc gặp gỡ quan trọng.",
    seasons: ["Thu", "Đông", "Xuân"],
    seasonsDesc: "Hương thơm ấm êm, quyến rũ nhất trong tiết trời se lạnh thu đông."
  },
  "fleur": {
    id: "fleur",
    name: "Fleur L'amour",
    subtitle: "Fleur L'amour • Peony & White Tea",
    badge: "Fruity Floral / Sweet",
    category: "sweet",
    categoryText: "Nhóm: Fruity Floral / Sweet",
    quote: "\"Một khúc ca dịu dàng như sớm mai dạo bước giữa vườn mẫu đơn nước Pháp – thanh thuần, tươi trẻ và ngập tràn tình yêu đời.\"",
    price10ml: 179000,
    price50ml: 549000,
    original10ml: "249.000đ",
    savingsText10ml: "Tiết kiệm 70k",
    original50ml: "649.000đ",
    savingsText50ml: "Tiết kiệm 100k",
    savingsText: "Tiết kiệm 100k",
    stock10ml: 60,
    stock50ml: 35,
    hidden: false,
    hidden10ml: false,
    hidden50ml: false,
    image: "fleur-lamour.webp",
    image50ml: "fleur-lamour.webp",
    image10ml: "fleur-pocket.webp",
    carouselImages: [
      { src: "fleur-1.webp", label: "Ảnh 1: Ảnh bìa / Cover" },
      { src: "fleur-2.webp", label: "Ảnh 2: Infographic Tầng Hương" },
      { src: "fleur-3.webp", label: "Ảnh 3: So sánh / Proof" },
      { src: "fleur-4.webp", label: "Ảnh 4: Hướng dẫn dùng Voucher" },
      { src: "fleur-5.webp", label: "Ảnh 5: Cam kết / Policy" }
    ],
    topNotes: "Dâu tây dại, Cam Bergamot, Quả mọng",
    topDesc: "Tươi tắn, ngọt nhẹ và bừng sáng năng lượng tích cực.",
    heartNotes: "Hoa mẫu đơn Pháp (Peony), Trà trắng, Hoa nhài Grasse",
    heartDesc: "Thanh tao, nữ tính và mềm mại như cánh hoa sớm mai.",
    baseNotes: "Xạ hương trắng, Gỗ tuyết tùng dịu, Hạnh nhân",
    baseDesc: "Vấn vương sạch sẽ, thanh khiết và bền lâu trên da.",
    longevity: "6 – 8 tiếng",
    longevityPercent: "75%",
    longevityDesc: "Lưu hương êm dịu, dễ chịu suốt ngày dài",
    sillage: "1 cánh tay (Dịu nhẹ)",
    sillagePercent: "60%",
    sillageDesc: "Thanh lịch, thoang thoảng gần gũi quanh người",
    occasions: ["Hằng ngày", "Đi làm", "Cà phê", "Hẹn hò"],
    occasionsDesc: "Nhẹ nhàng, thư thái cho những buổi cà phê dạo phố hay làm việc văn phòng.",
    seasons: ["Xuân", "Hạ"],
    seasonsDesc: "Tươi tắn, thanh mát ngập tràn năng lượng nắng sớm xuân hè."
  },
  "botanique": {
    id: "botanique",
    name: "L'amour Botanique",
    subtitle: "L'amour Botanique • Green Tea & Bergamot",
    badge: "Fresh Green / Citrus",
    category: "fresh",
    categoryText: "Nhóm: Fresh Green / Citrus",
    quote: "\"Một làn gió sớm trong trẻo qua khu vườn thảo mộc miền Nam nước Pháp – sảng khoái, tĩnh tại và tràn đầy sinh khí.\"",
    price10ml: 179000,
    price50ml: 599000,
    original10ml: "249.000đ",
    savingsText10ml: "Tiết kiệm 70k",
    original50ml: "699.000đ",
    savingsText50ml: "Tiết kiệm 100k",
    savingsText: "Tiết kiệm 100k",
    stock10ml: 30,
    stock50ml: 15,
    hidden: false,
    hidden10ml: false,
    hidden50ml: false,
    image: "botanique-lamour.webp",
    image50ml: "botanique-lamour.webp",
    image10ml: "botanique-pocket.webp",
    carouselImages: [
      { src: "Botan-1.webp", label: "Ảnh 1: Ảnh bìa / Cover" },
      { src: "Botan-2.webp", label: "Ảnh 2: Infographic Tầng Hương" },
      { src: "Botan-3.webp", label: "Ảnh 3: So sánh / Proof" },
      { src: "Botan-4.webp", label: "Ảnh 4: Hướng dẫn dùng Voucher" },
      { src: "Botan-5.webp", label: "Ảnh 5: Cam kết / Policy" }
    ],
    topNotes: "Cam Bergamot Ý, Quả chanh xanh, Cam Mandarin",
    topDesc: "Sảng khoái, bừng tỉnh các giác quan ngay tức khắc.",
    heartNotes: "Lá trà xanh tươi, Hoa cam Neroli, Cỏ xạ hương",
    heartDesc: "Thanh mát, thư thái tâm hồn như tách trà sớm mai.",
    baseNotes: "Cỏ hương bài (Vetiver), Gỗ sồi, Xạ hương sương sớm",
    baseDesc: "Khô ráo, sạch sẽ và tươi mát dài lâu.",
    longevity: "6 – 7 tiếng",
    longevityPercent: "70%",
    longevityDesc: "Lưu hương thanh sạch, mát mẻ trên da",
    sillage: "1 cánh tay (Tươi mát)",
    sillagePercent: "60%",
    sillageDesc: "Dịu nhẹ, tươi mát như làn gió sớm mai",
    occasions: ["Đi làm", "Thể thao", "Dạo phố hè"],
    occasionsDesc: "Sảng khoái, tràn đầy năng lượng cho công sở và hoạt động ngoài trời.",
    seasons: ["Xuân", "Hạ"],
    seasonsDesc: "Đặc biệt sảng khoái và thư thái trong ngày hè oi ả."
  },
  "nuit": {
    id: "nuit",
    name: "Nuit L'amour",
    subtitle: "Nuit L'amour • Warm Wood & Amber",
    badge: "Amber Woody / Warm",
    category: "warm",
    categoryText: "Nhóm: Amber Woody / Warm",
    quote: "\"Bản tình ca bóng đêm bên bờ sông Seine – ấm áp, nồng nàn và ẩn chứa sức hút quyền lực không thể cưỡng lại.\"",
    price10ml: 179000,
    price50ml: 599000,
    original10ml: "249.000đ",
    savingsText10ml: "Tiết kiệm 70k",
    original50ml: "699.000đ",
    savingsText50ml: "Tiết kiệm 100k",
    savingsText: "Tiết kiệm 100k",
    stock10ml: 25,
    stock50ml: 12,
    hidden: false,
    hidden10ml: false,
    hidden50ml: false,
    image: "nuit-lamour.webp",
    image50ml: "nuit-lamour.webp",
    image10ml: "nuit-pocket.webp",
    carouselImages: [
      { src: "nuit-1.webp", label: "Ảnh 1: Ảnh bìa / Cover" },
      { src: "nuit-2.webp", label: "Ảnh 2: Infographic Tầng Hương" },
      { src: "nuit-3.webp", label: "Ảnh 3: So sánh / Proof" },
      { src: "nuit-4.webp", label: "Ảnh 4: Hướng dẫn dùng Voucher" },
      { src: "nuit-5.webp", label: "Ảnh 5: Cam kết / Policy" }
    ],
    topNotes: "Tiêu hồng, Nhục đậu khấu, Quả lý chua đen",
    topDesc: "Cay nhẹ kích thích, cuốn hút và bí ẩn.",
    heartNotes: "Hoa hồng đen huyền bí, Trầm hương nhẹ (Oud), Hoa phong lữ",
    heartDesc: "Nồng nàn, sang trọng và đậm chất vương giả.",
    baseNotes: "Hổ phách đậm, Gỗ tuyết tùng, Hoắc hương ấm",
    baseDesc: "Dư vị sâu thẳm, bám tỏa kiên cố suốt đêm tiệc.",
    longevity: "8 – 10 tiếng",
    longevityPercent: "95%",
    longevityDesc: "Lưu hương cực kỳ bền bỉ đến tận sáng hôm sau",
    sillage: "Hơn 1 cánh tay (Nồng nàn)",
    sillagePercent: "85%",
    sillageDesc: "Lan tỏa mạnh mẽ, tạo ấn tượng khó phai trong bán kính 2m",
    occasions: ["Tiệc tối", "Sự kiện lớn", "Hẹn hò lãng mạn đêm"],
    occasionsDesc: "Bí ẩn, sang trọng và cuốn hút nổi bật giữa tiệc tối xa hoa.",
    seasons: ["Thu", "Đông"],
    seasonsDesc: "Chiều sâu nồng nàn hoàn hảo cho những đêm thu đông lạnh."
  },
  "soleil": {
    id: "soleil",
    name: "Soleil L'amour",
    subtitle: "Soleil L'amour • Laurel & Pink Grapefruit",
    badge: "Citrus Gourmand / Sunny",
    category: "fresh",
    categoryText: "Nhóm: Citrus Gourmand / Sunny",
    quote: "\"Ánh nắng vàng óng ả rực rỡ của Riviera nước Pháp – ngọt ngào bưởi mọng nước, thơm lừng nguyệt quế và nụ cười rạng ngời.\"",
    price10ml: 179000,
    price50ml: 599000,
    original10ml: "249.000đ",
    savingsText10ml: "Tiết kiệm 70k",
    original50ml: "699.000đ",
    savingsText50ml: "Tiết kiệm 100k",
    savingsText: "Tiết kiệm 100k",
    stock10ml: 40,
    stock50ml: 20,
    hidden: false,
    hidden10ml: false,
    hidden50ml: false,
    image: "soleil-lamour.webp",
    image50ml: "soleil-lamour.webp",
    image10ml: "soleil-pocket.webp",
    carouselImages: [
      { src: "soleil-1.webp", label: "Ảnh 1: Ảnh bìa / Cover" },
      { src: "soleil-2.webp", label: "Ảnh 2: Infographic Tầng Hương" },
      { src: "soleil-3.webp", label: "Ảnh 3: So sánh / Proof" },
      { src: "soleil-4.webp", label: "Ảnh 4: Hướng dẫn dùng Voucher" },
      { src: "soleil-5.webp", label: "Ảnh 5: Cam kết / Policy" }
    ],
    topNotes: "Bưởi hồng mọng nước, Quýt ngọt, Lá nguyệt quế Địa Trung Hải",
    topDesc: "Tràn đầy sức sống, tươi sáng và rạng rỡ.",
    heartNotes: "Hoa cam Pháp, Gừng tươi, Hạnh nhân nướng",
    heartDesc: "Ấm áp, ngọt dịu và ngon ngọt kích thích vị giác.",
    baseNotes: "Gỗ tuyết tùng vàng, Vani ngọt dịu, Xạ hương hổ phách",
    baseDesc: "Lưu hương êm đềm như ánh chiều tà ấm áp.",
    longevity: "6 – 8 tiếng",
    longevityPercent: "75%",
    longevityDesc: "Lưu hương bền lâu, ngọt lành ấm áp",
    sillage: "1 cánh tay (Vừa phải)",
    sillagePercent: "65%",
    sillageDesc: "Tỏa hương vừa phải, ngọt ngào dễ chịu",
    occasions: ["Du lịch", "Cà phê cuối tuần", "Đi làm"],
    occasionsDesc: "Rạng rỡ, tích cực cho những chuyến du ngoạn hay cà phê gặp gỡ bạn bè.",
    seasons: ["Xuân", "Hạ", "Thu"],
    seasonsDesc: "Tràn ngập ánh nắng vàng ấm áp của vùng Địa Trung Hải."
  },
  "poire": {
    id: "poire",
    name: "Poire Givrée",
    subtitle: "Poire Givrée • Iced Pear & White Freesia",
    badge: "Iced Pear & Freesia",
    category: "fresh",
    categoryText: "Nhóm: Fruity Floral / Fresh",
    quote: "\"Giọt sương mai đọng trên quả lê tuyết mọng nước quyện cùng lan nam phi trắng – thanh khiết, mát lạnh và bừng sáng rạng rỡ.\"",
    price10ml: 179000,
    price50ml: 599000,
    original10ml: "249.000đ",
    savingsText10ml: "Tiết kiệm 70k",
    original50ml: "749.000đ",
    savingsText50ml: "Tiết kiệm 150k",
    savingsText: "Tiết kiệm 150k",
    stock10ml: 50,
    stock50ml: 30,
    hidden: false,
    hidden10ml: false,
    hidden50ml: false,
    image: "Poire-50ml.webp",
    image50ml: "Poire-50ml.webp",
    image10ml: "Poire-10ml.webp",
    carouselImages: [
      { src: "Poire-1.webp", label: "Ảnh 1: Ảnh bìa / Cover" },
      { src: "Poire-2.webp", label: "Ảnh 2: Infographic Tầng Hương" },
      { src: "Poire-3.webp", label: "Ảnh 3: So sánh / Proof" },
      { src: "Poire-4.webp", label: "Ảnh 4: Hướng dẫn dùng Voucher" },
      { src: "Poire-5.webp", label: "Ảnh 5: Cam kết / Policy" }
    ],
    topNotes: "Quả lê tuyết (Iced Pear), Cam Bergamot mát lạnh, Dưa gang",
    topDesc: "Mở đầu mát lạnh như cắn ngập quả lê tuyết mọng nước giữa trời Paris.",
    heartNotes: "Hoa lan Nam Phi trắng (White Freesia), Hoa hồng dại, Quả mộc qua",
    heartDesc: "Nốt hương hoa thanh tao, mềm mại và trong vắt tựa sương mai.",
    baseNotes: "Cây đại hoàng, Hoắc hương trắng, Hổ phách nhẹ, Xạ hương sạch",
    baseDesc: "Lưu lại sự êm dịu, tinh tươm và sạch sẽ suốt nhiều giờ.",
    longevity: "7 – 9 tiếng",
    longevityPercent: "85%",
    longevityDesc: "Lưu hương tốt trên da và vải áo",
    sillage: "1 cánh tay (Thanh thoát)",
    sillagePercent: "70%",
    sillageDesc: "Mát mẻ, dễ chịu, không nồng gắt trong không gian kín",
    occasions: ["Công sở", "Dạo phố mùa hè", "Hẹn hò nhẹ nhàng"],
    occasionsDesc: "Lý tưởng cho ngày làm việc văn phòng hoặc buổi sáng dạo phố thư thái.",
    seasons: ["Xuân", "Hạ", "Thu"],
    seasonsDesc: "Tươi mát và sảng khoái nhất trong những ngày nắng đẹp hoặc xuân hè."
  }
};

const PRODUCTS_STORAGE_KEY = 'delamour_products_custom_v3';

window.getCustomProductsData = function() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || '{}');
    const merged = {};
    Object.keys(DEFAULT_PRODUCTS_DATA).forEach(k => {
      merged[k] = { ...DEFAULT_PRODUCTS_DATA[k] };
    });
    Object.keys(saved).forEach(k => {
      if (saved[k] === null) {
        delete merged[k];
      } else {
        merged[k] = { ...merged[k], ...saved[k] };
      }
    });
    return merged;
  } catch(e) {
    return { ...DEFAULT_PRODUCTS_DATA };
  }
};

window.saveCustomProductsData = function(productsMap) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsMap));
    if (typeof window.PRODUCTS_DATA !== 'undefined') {
      window.PRODUCTS_DATA = window.getCustomProductsData();
    }
  } catch(e) {
    console.error("Lỗi khi lưu cấu hình sản phẩm:", e);
  }
};

window.DEFAULT_PRODUCTS_DATA = DEFAULT_PRODUCTS_DATA;
window.PRODUCTS_DATA = window.getCustomProductsData();
