// src/config.js

export const VERSION = "V4.2.0";             // 系統版本號
export const FAST_IP_COUNT = 20;             // 優質 IP 數量
export const AUTO_TEST_MAX_IPS = 45;        // 定時任務測速最大數量 (安全限制在 45 以內)
export const SAFE_SUBREQUEST_LIMIT = 45;    // 子請求安全硬上限，防止免費方案部署時發生異常
export const BROWSER_TEST_MAX_IPS = 1000;    // 新增：瀏覽器測速的最大數量 (可設定 500 甚至更高)

// IP 來源網址列表 (亞洲優化庫)
export const CIDR_SOURCE_URLS = [
    'https://bestcf.pages.dev/uouin/all.txt',
    'https://bestcf.pages.dev/wetest/ipv4.txt',
    'https://bestcf.pages.dev/moistr/all.txt',
    'https://bestcf.pages.dev/gslege/Cfxyz.txt',
    'https://bestcf.pages.dev/gslege/SG.txt',
    'https://bestcf.pages.dev/gslege/US.txt',
    'https://bestcf.pages.dev/gslege/JP.txt',
    'https://bestcf.pages.dev/cfyes/ipv4.txt',
    'https://bestcf.pages.dev/nirevil/ipv4.txt',
    'https://raw.githubusercontent.com/ymyuuu/IPDB/refs/heads/main/BestCF/bestcfv4.txt',
    'https://bestcf.pages.dev/zhixuanwang/ipv4-onlyip.txt',
    'https://raw.githubusercontent.com/joname1/BestCFip/refs/heads/main/ipv4.txt',
    'https://raw.githubusercontent.com/Senflare/Senflare-IP/refs/heads/main/IPlist-Pro.txt',
    'https://bestcf.pages.dev/vvhan/ipv4.txt',
    'https://bestcf.pages.dev/ircf/ipv4.txt',
    'https://raw.githubusercontent.com/gshtwy/CF-DNS-Clone/refs/heads/main/wetest-cloudflare-v4.txt',
    'https://090227.pages.dev/bestcf?isp=all&ips=20',
    'https://090227.pages.dev/bestcf?isp=ct&ips=50',
];

// 全球機房代碼對照表
export const COLO_MAP = {
    'HKG': '香港', 'TPE': '台北', 'NRT': '東京', 'KIX': '大阪', 'ICN': '首爾', 'FUK': '福岡', 'OKA': '沖繩', 'CTS': '札幌', 'KHH': '高雄',
    'SIN': '新加坡', 'KUL': '吉隆坡', 'BKK': '曼谷', 'MNL': '馬尼拉', 'SGN': '胡志明市', 'HAN': '河內', 'CGK': '雅加達', 'KNO': '棉蘭', 'DPS': '峇里島', 'PNH': '金邊', 'RGN': '仰光', 'VTE': '永珍',
    'LAX': '洛杉磯', 'SJC': '聖荷西', 'SFO': '舊金山', 'SEA': '西雅圖', 'PDX': '波特蘭', 'YVR': '溫哥華', 'SAN': '聖地牙哥', 'PHX': '鳳凰城', 'LAS': '拉斯維加斯', 'SMF': '沙加緬度', 'SLC': '鹽湖城',
    'JFK': '紐約', 'EWR': '紐華克', 'ORD': '芝加哥', 'IAD': '華盛頓', 'MIA': '邁阿密', 'DFW': '達拉斯', 'IAH': '休士頓', 'ATL': '亞特蘭大', 'YYZ': '多倫多', 'YUL': '蒙特婁', 'DEN': '丹佛', 'BOS': '波士頓', 'PHL': '費城', 'DTW': '底特律', 'MSP': '明尼阿波利斯',
    'LHR': '倫敦', 'AMS': '阿姆斯特丹', 'FRA': '法蘭克福', 'CDG': '巴黎', 'MAD': '馬德里', 'ZRH': '蘇黎世', 'MXP': '米蘭', 'VIE': '維也納', 'ARN': '斯德哥爾摩', 'OSL': '奧斯陸', 'CPH': '哥本哈根', 'HEL': '赫爾辛基', 'WAW': '華沙', 'PRG': '布拉格', 'BUD': '布達佩斯', 'OTP': '布加勒斯特', 'ATH': '雅典', 'IST': '伊斯坦堡', 'DUB': '都裂林', 'BRU': '布魯塞爾', 'MUC': '慕尼黑', 'TXL': '柏林', 'LIS': '里斯本', 'FCO': '羅馬', 'BCN': '巴塞隆納',
    'SYD': '雪梨', 'MEL': '墨爾本', 'BNE': '布里斯本', 'PER': '伯斯', 'AKL': '奧克蘭', 'ADL': '阿得雷德', 'CBR': '坎培拉',
    'SCL': '聖地亞哥', 'GRU': '聖保羅', 'EZE': '布宜諾斯艾利斯', 'BOG': '波哥大', 'LIM': '利馬', 'GIG': '里約熱內盧', 'QRO': '克雷塔羅',
    'DXB': '杜拜', 'TLV': '特拉維夫', 'DOH': '杜哈', 'JNB': '約翰尼斯堡', 'CPT': '開普敦', 'BOM': '孟買', 'DEL': '德里', 'MAA': '清奈', 'HYD': '海得拉巴', 'KWI': '科威特', 'RUH': '利雅德', 'MCT': '馬斯喀特'
};
