// src/utils.js

export function ipToNum(ip) { 
    return ip.split('.').reduce((a, b) => a * 256 + parseInt(b), 0); 
}

export function numToIp(n) { 
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'); 
}

export function isValidIPv4(ip) { 
    return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip); 
}

export function jsonResponse(data, status = 200) { 
    return new Response(JSON.stringify(data), { 
        status, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    }); 
}

export function handleCORS() { 
    return new Response(null, { 
        headers: { 
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
            'Access-Control-Allow-Headers': 'Content-Type, Authorization' 
        } 
    }); 
}

// 新增：檢查某個 IP 是否落在特定的 CIDR 網段內
export function isIpInCidr(ip, cidr) {
    try {
        const [cidrIp, maskStr] = cidr.split('/');
        const maskBits = parseInt(maskStr || '32');
        const start = ipToNum(cidrIp);
        const totalIPs = Math.pow(2, 32 - maskBits);
        const end = start + totalIPs - 1;
        const num = ipToNum(ip);
        return num >= start && num <= end;
    } catch {
        return false;
    }
}

// 新增：檢查 IP 是否屬於 Cloudflare 官方 IP 集
export function isCloudflareIP(ip, cfCidrs) {
    return cfCidrs.some(cidr => isIpInCidr(ip, cidr));
}
