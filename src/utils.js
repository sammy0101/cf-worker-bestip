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
