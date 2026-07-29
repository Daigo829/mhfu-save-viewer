/* ============================================================
   >>> EMBEDDED SAVETOOLS DECRYPTOR  (BEGIN)  <<<
   ------------------------------------------------------------
   Self-contained. Turns a raw MHP2NDG.BIN into character slots.
   Runs ONCE, only when a raw BIN is dropped into the viewer.

     LAYER 1 = PSP hardware layer   (AES-128-CBC; SED-PC equivalent)
     LAYER 2 = game save layer      (substitution + XOR; QuickBMS .bms equivalent)
     LAYER 3 = slot extraction      (fixed byte offsets -> character1/2/3.sav)

   Ported from:
     - mhef (Seth VanHeulen)          -> PSP AES layer keys + algorithm
     - MHFU_SaveDecrypter.bms (HenryEx) -> game-layer substitution + XOR schedule
     - MHFUdic_de.bin                 -> 256-byte substitution table

   This module ONLY decrypts and reads. It never writes to disk, never
   phones home, and holds everything in memory. The viewer (app.js) is the
   only caller; it hands us a Uint8Array and gets back 3 slot buffers.

   PUBLIC API:
     MHFUDecryptor.SIZE_PSP_ENC   = 1483024  (still PSP-encrypted)
     MHFUDecryptor.SIZE_PSP_DEC   = 1483008  (PSP-decrypted, still game-encrypted)
     MHFUDecryptor.SIZE_SLOT      = 438528   (one decrypted characterX.sav)
     MHFUDecryptor.decryptBIN(bytes) ->
         { ok:true,  region:"US/EU"|"JP", slots:[ {name, bytes(438528), empty} x3 ] }
       | { ok:false, error:"..." }
   ============================================================ */
(function (global) {
  "use strict";

  // ============================================================
  // EMBEDDED CONSTANTS  (do not edit; sourced from the files named above)
  // ============================================================

  // --- LAYER 2: game-layer 256-byte substitution table (MHFUdic_de.bin) ---
  var SAVEDEC = [86,124,154,138,31,56,16,63,101,234,64,248,92,252,162,118,199,1,139,235,171,205,215,20,152,191,166,82,233,133,246,72,137,156,126,6,122,230,143,26,176,29,105,244,62,172,77,4,85,40,194,35,155,214,61,237,197,50,0,108,119,71,211,200,208,11,135,125,251,204,192,27,147,36,117,236,240,55,141,229,132,220,243,76,68,123,209,12,73,65,186,30,9,13,34,17,104,160,107,165,189,130,179,131,54,216,183,8,201,184,3,48,129,254,2,253,226,177,45,58,97,161,5,39,112,89,232,120,151,46,21,249,43,218,25,51,24,78,127,157,187,225,32,219,103,180,57,163,70,142,134,190,81,60,198,116,80,167,175,196,128,102,221,164,174,38,74,109,15,178,75,53,94,47,33,99,100,228,14,168,206,42,224,41,145,150,115,22,67,181,98,90,52,84,242,149,93,222,121,28,213,18,10,250,227,169,136,238,148,203,23,182,106,153,83,146,19,110,239,37,173,255,207,158,49,69,202,140,144,210,170,188,91,159,96,79,114,111,223,88,7,245,195,95,87,113,44,241,247,212,66,185,217,231,193,59];

  // --- LAYER 1: PSP AES layer constants (mhef psp.py, MHP2/MHP2G/MHP3 set) ---
  var CIPHER1 = [112,68,163,174,239,93,165,242,133,127,242,214,148,245,54,59];   // _hash_key_6
  var CIPHER2 = [236,109,41,89,38,53,165,127,151,42,13,188,163,38,51,0];         // _hash_key_7
  var CIPHER3 = [93,199,17,57,208,25,56,188,2,127,221,220,176,131,125,157];      // _aes_key_12
  var CIPHER4 = [3,179,2,232,95,243,129,177,59,141,170,42,144,255,94,97];        // _aes_key_64
  var KEY_JP  = [205,31,32,89,174,112,239,104,220,162,69,19,180,90,219,10];      // _mhp2g_jp_key  (ULJM05500)
  var KEY_NA  = [74,31,243,89,174,182,239,248,28,168,203,35,188,165,123,179];    // _mhp2g_na_key  (ULUS10391 / ULES01213)

  // --- LAYER 2: game-layer XOR key schedule constants (from the .bms) ---
  var KEY_LOWDEFAULT = 0x215F, KEY_HIGHDEFAULT = 0xDFA3;
  var KEY_LOWMOD = 0xFF8F,     KEY_HIGHMOD = 0xFFEF;

  // --- region detection: salted SHA-1 salts (JP vs NA; EU reuses NA) ---
  var SALT_JP = "S)R?Bf8xW3#5h9lGU8wR";
  var SALT_NA = "3Nc94Hq1zOLh8d62Sb69";

  // --- sizes / offsets ---
  var SIZE_PSP_ENC = 0x16A110;   // 1,483,024  raw off the memory stick
  var SIZE_PSP_DEC = 0x16A100;   // 1,483,008  PSP-decrypted, still game-encrypted
  var SIZE_SLOT    = 0x6B100;    //   438,528  one decrypted characterX.sav
  var SLOT_OFFSETS = [0x001000, 0x06C100, 0x0D7200];
  var GAME_BODY    = 0x16A0FC;   // decrypted region length (key sits at 0x16A0FC)
  var HASH_AT      = 0x16A0E8;   // stored salted SHA-1 (20 bytes)
  var HASH_BODY    = 0x16A0DC;   // bytes hashed with the salt

  // ============================================================
  // AES-128  (decrypt only; synchronous; for LAYER 1)
  // Small classic implementation so index.html works over file:// with no
  // build step and no Web Crypto padding quirks.
  // ============================================================
  var AES = (function () {
    // Standard AES S-box (FIPS-197). Inverse derived from it at init.
    var SBOX = new Uint8Array([
      0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
      0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
      0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
      0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
      0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
      0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
      0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
      0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
      0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
      0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
      0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
      0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
      0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
      0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
      0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
      0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
    ]);
    var INV = new Uint8Array(256);
    for (var _i = 0; _i < 256; _i++) INV[SBOX[_i]] = _i;

    function xtime(a) { return ((a << 1) ^ (a & 0x80 ? 0x11b : 0)) & 0xff; }
    function mul(a, b) {
      var r = 0;
      for (var i = 0; i < 8; i++) {
        if (b & 1) r ^= a;
        var hi = a & 0x80; a = (a << 1) & 0xff; if (hi) a ^= 0x1b;
        b >>= 1;
      }
      return r & 0xff;
    }

    function expandKey(key) { // key: 16-byte array -> 176-byte round keys
      var rk = new Uint8Array(176);
      for (var i = 0; i < 16; i++) rk[i] = key[i];
      var rcon = 1;
      for (var i2 = 16; i2 < 176; i2 += 4) {
        var a = rk[i2 - 4], b = rk[i2 - 3], c = rk[i2 - 2], d = rk[i2 - 1];
        if (i2 % 16 === 0) {
          var t = a; a = SBOX[b] ^ rcon; b = SBOX[c]; c = SBOX[d]; d = SBOX[t];
          rcon = xtime(rcon);
        }
        rk[i2]     = rk[i2 - 16] ^ a;
        rk[i2 + 1] = rk[i2 - 15] ^ b;
        rk[i2 + 2] = rk[i2 - 14] ^ c;
        rk[i2 + 3] = rk[i2 - 13] ^ d;
      }
      return rk;
    }

    function addRoundKey(s, rk, off) { for (var i = 0; i < 16; i++) s[i] ^= rk[off + i]; }
    function invSubBytes(s) { for (var i = 0; i < 16; i++) s[i] = INV[s[i]]; }
    function invShiftRows(s) {
      var t;
      t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;             // row1 >> 1
      t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;    // row2 >> 2
      t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;           // row3 >> 3
    }
    function invMixColumns(s) {
      for (var c = 0; c < 4; c++) {
        var i = c * 4, a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
        s[i]     = mul(a0,14) ^ mul(a1,11) ^ mul(a2,13) ^ mul(a3,9);
        s[i + 1] = mul(a0,9)  ^ mul(a1,14) ^ mul(a2,11) ^ mul(a3,13);
        s[i + 2] = mul(a0,13) ^ mul(a1,9)  ^ mul(a2,14) ^ mul(a3,11);
        s[i + 3] = mul(a0,11) ^ mul(a1,13) ^ mul(a2,9)  ^ mul(a3,14);
      }
    }
    function decryptBlock(rk, block) { // block: Uint8Array(16) -> new Uint8Array(16)
      var s = new Uint8Array(16); s.set(block);
      addRoundKey(s, rk, 160);
      for (var round = 9; round >= 1; round--) {
        invShiftRows(s); invSubBytes(s); addRoundKey(s, rk, round * 16); invMixColumns(s);
      }
      invShiftRows(s); invSubBytes(s); addRoundKey(s, rk, 0);
      return s;
    }

    // CBC decrypt with IV = 16 zero bytes (matches mhef AES.MODE_CBC, iv=0).
    function cbcDecryptZeroIV(keyArr, data) { // data: Uint8Array (mult. of 16)
      var rk = expandKey(keyArr);
      var out = new Uint8Array(data.length);
      var prev = new Uint8Array(16); // IV = zeros
      var blk = new Uint8Array(16);
      for (var off = 0; off < data.length; off += 16) {
        blk.set(data.subarray(off, off + 16));
        var dec = decryptBlock(rk, blk);
        for (var i = 0; i < 16; i++) out[off + i] = dec[i] ^ prev[i];
        prev.set(blk);
      }
      return out;
    }
    return { cbcDecryptZeroIV: cbcDecryptZeroIV };
  })();

  // ============================================================
  // SHA-1  (synchronous; used only as the region-detect oracle)
  // ============================================================
  function sha1(bytes) { // bytes: Uint8Array -> Uint8Array(20)
    var ml = bytes.length * 8;
    var withPad = new Uint8Array(((bytes.length + 8) >> 6) * 64 + 64);
    withPad.set(bytes);
    withPad[bytes.length] = 0x80;
    // 64-bit big-endian length in the last 8 bytes
    var lenHi = Math.floor(ml / 0x100000000), lenLo = ml >>> 0;
    var p = withPad.length;
    withPad[p - 1] = lenLo & 0xff; withPad[p - 2] = (lenLo >>> 8) & 0xff;
    withPad[p - 3] = (lenLo >>> 16) & 0xff; withPad[p - 4] = (lenLo >>> 24) & 0xff;
    withPad[p - 5] = lenHi & 0xff; withPad[p - 6] = (lenHi >>> 8) & 0xff;
    withPad[p - 7] = (lenHi >>> 16) & 0xff; withPad[p - 8] = (lenHi >>> 24) & 0xff;

    var h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
    var w = new Int32Array(80);
    function rol(x, n) { return (x << n) | (x >>> (32 - n)); }
    for (var i = 0; i < withPad.length; i += 64) {
      for (var t = 0; t < 16; t++) {
        w[t] = (withPad[i + t*4] << 24) | (withPad[i + t*4 + 1] << 16) |
               (withPad[i + t*4 + 2] << 8) | (withPad[i + t*4 + 3]);
      }
      for (var t2 = 16; t2 < 80; t2++) w[t2] = rol(w[t2-3] ^ w[t2-8] ^ w[t2-14] ^ w[t2-16], 1);
      var a = h0, b = h1, c = h2, d = h3, e = h4;
      for (var j = 0; j < 80; j++) {
        var f, k;
        if (j < 20)      { f = (b & c) | (~b & d);            k = 0x5A827999; }
        else if (j < 40) { f = b ^ c ^ d;                    k = 0x6ED9EBA1; }
        else if (j < 60) { f = (b & c) | (b & d) | (c & d);  k = 0x8F1BBCDC; }
        else             { f = b ^ c ^ d;                    k = 0xCA62C1D6; }
        var tmp = (rol(a, 5) + f + e + k + w[j]) | 0;
        e = d; d = c; c = rol(b, 30); b = a; a = tmp;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    var out = new Uint8Array(20), hs = [h0, h1, h2, h3, h4];
    for (var n = 0; n < 5; n++) {
      out[n*4] = (hs[n] >>> 24) & 0xff; out[n*4+1] = (hs[n] >>> 16) & 0xff;
      out[n*4+2] = (hs[n] >>> 8) & 0xff; out[n*4+3] = hs[n] & 0xff;
    }
    return out;
  }

  // ============================================================
  // LAYER 1 : PSP hardware layer  (AES-128-CBC; SED-PC equivalent)
  // 1483024 -> 1483008.  gameKey selects region.
  // ============================================================
  function pspDecrypt(buff, gameKey) {
    var n = buff.length;
    // recover the 16-byte per-file XOR key from the header
    var xorKey = new Uint8Array(16);
    for (var i = 0; i < 16; i++) xorKey[i] = buff[i] ^ CIPHER2[i] ^ gameKey[i];
    xorKey = AES.cbcDecryptZeroIV(CIPHER3, xorKey).subarray(0, 12);
    var key12 = new Uint8Array(12);
    for (var i2 = 0; i2 < 12; i2++) key12[i2] = xorKey[i2] ^ CIPHER1[i2];

    // build [ key12 | blockIndex(u32 LE) ] stream, one 16-byte block per body block
    var blocks = (n / 16) - 1;            // mhef: range(1, len(buff)//16)
    var stream = new Uint8Array(blocks * 16);
    for (var b = 1; b <= blocks; b++) {
      var off = (b - 1) * 16;
      stream.set(key12, off);
      stream[off + 12] = b & 0xff; stream[off + 13] = (b >>> 8) & 0xff;
      stream[off + 14] = (b >>> 16) & 0xff; stream[off + 15] = (b >>> 24) & 0xff;
    }
    var keystream = AES.cbcDecryptZeroIV(CIPHER4, stream);

    var out = new Uint8Array(n - 16);
    for (var k = 0; k < out.length; k++) out[k] = buff[16 + k] ^ keystream[k];
    return out;
  }

  // ============================================================
  // LAYER 2 : game save layer  (substitution + rolling XOR; the .bms)
  // Operates on the 1483008-byte PSP-decrypted blob. Returns the decrypted
  // body (0x16A0FC bytes); character slots are cut from this.
  // ============================================================
  function gameDecrypt(psp) {
    var body = psp.slice(0, GAME_BODY);              // MEMORY_FILE
    var keyBytes = psp.subarray(GAME_BODY, GAME_BODY + 4); // MEMORY_FILE2 (the key)

    // recover the seed key: each of the 4 key bytes through SAVEDEC twice
    var kb = new Uint8Array(4);
    for (var i = 0; i < 4; i++) kb[i] = SAVEDEC[SAVEDEC[keyBytes[i]]];
    var SKEY = (kb[0] | (kb[1] << 8) | (kb[2] << 16) | (kb[3] << 24)) >>> 0;

    // initialise key
    var LOKEY = SKEY & 0xFFFF, HIKEY = SKEY >>> 16;
    if (HIKEY === 0)      { HIKEY = KEY_HIGHDEFAULT; }
    else if (LOKEY === 0) { LOKEY = KEY_LOWDEFAULT; HIKEY = KEY_HIGHDEFAULT; }
    SKEY = (((HIKEY << 16) >>> 0) + LOKEY) >>> 0;

    // substitution pass #1
    for (var s1 = 0; s1 < GAME_BODY; s1++) body[s1] = SAVEDEC[body[s1]];

    // rolling XOR over each u32 LE block
    var dv = new DataView(body.buffer, body.byteOffset, body.byteLength);
    var blocks = GAME_BODY >>> 2; // 370751
    for (var b2 = 0; b2 < blocks; b2++) {
      var lo = ((SKEY & 0xFFFF) * KEY_LOWDEFAULT) % KEY_LOWMOD;
      var hi = ((SKEY >>> 16) * KEY_HIGHDEFAULT) % KEY_HIGHMOD;
      SKEY = (((hi << 16) >>> 0) + lo) >>> 0;
      var pos = b2 << 2;
      var v = dv.getUint32(pos, true);
      dv.setUint32(pos, (v ^ SKEY) >>> 0, true);
    }

    // substitution pass #2
    for (var s2 = 0; s2 < GAME_BODY; s2++) body[s2] = SAVEDEC[body[s2]];
    return body;
  }

  // region oracle: does the salted SHA-1 in the decrypted body match?
  function hashMatches(body, salt) {
    var stored = body.subarray(HASH_AT, HASH_AT + 20);
    var toHash = new Uint8Array(HASH_BODY + salt.length);
    toHash.set(body.subarray(0, HASH_BODY));
    for (var i = 0; i < salt.length; i++) toHash[HASH_BODY + i] = salt.charCodeAt(i);
    var calc = sha1(toHash);
    for (var j = 0; j < 20; j++) if (calc[j] !== stored[j]) return false;
    return true;
  }

  // ============================================================
  // LAYER 3 : slot extraction  (fixed offsets -> characterX.sav)
  // ============================================================
  function readSlotName(bytes) {
    // UTF-16LE name at offset 0, up to 10 chars; blank => empty slot
    var s = "";
    for (var i = 0; i < 20; i += 2) {
      var code = bytes[i] | (bytes[i + 1] << 8);
      if (code === 0) break;
      s += String.fromCharCode(code);
    }
    return s;
  }
  function extractSlots(body) {
    var slots = [];
    for (var i = 0; i < 3; i++) {
      var off = SLOT_OFFSETS[i];
      var buf = body.slice(off, off + SIZE_SLOT);
      var name = readSlotName(buf);
      slots.push({ name: name, bytes: buf, empty: name.length === 0 });
    }
    return slots;
  }

  // ============================================================
  // PUBLIC ENTRY POINT
  // ============================================================
  function runFromPspDecrypted(pspDec) {
    // try US/EU first, then JP; validate with the SHA-1 oracle
    var body = gameDecrypt(pspDec.slice(0));
    if (hashMatches(body, SALT_NA)) return { region: "US/EU", body: body };
    if (hashMatches(body, SALT_JP)) return { region: "JP", body: body };
    return null; // game layer produced no valid hash for either region
  }

  function decryptBIN(input) {
    try {
      var bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

      // Already game-layer only (PSP encryption already off, e.g. PPSSPP default)
      if (bytes.length === SIZE_PSP_DEC) {
        var r0 = runFromPspDecrypted(bytes);
        if (!r0) return { ok: false, error: "Decryption failed: this is not a recognized MHFU/MHP2G save (SHA-1 check failed for both regions)." };
        return { ok: true, region: r0.region, slots: extractSlots(r0.body) };
      }

      // Still PSP-encrypted: peel LAYER 1 first. Region is unknown, so try both
      // game keys and let the game-layer SHA-1 oracle confirm which is right.
      if (bytes.length === SIZE_PSP_ENC) {
        var attempts = [ { key: KEY_NA, region: "US/EU" }, { key: KEY_JP, region: "JP" } ];
        for (var a = 0; a < attempts.length; a++) {
          var pspDec = pspDecrypt(bytes, attempts[a].key);
          if (pspDec.length !== SIZE_PSP_DEC) continue;
          var body = gameDecrypt(pspDec.slice(0));
          var salt = attempts[a].region === "JP" ? SALT_JP : SALT_NA;
          if (hashMatches(body, salt)) {
            return { ok: true, region: attempts[a].region, slots: extractSlots(body) };
          }
        }
        return { ok: false, error: "Could not decrypt: PSP layer key did not match JP or US/EU. Is this an MHFU / MHP2G MHP2NDG.BIN?" };
      }

      return { ok: false, error: "Unexpected file size " + bytes.length.toLocaleString() +
        " bytes. Expected a raw MHP2NDG.BIN (1,483,024 or 1,483,008 bytes)." };
    } catch (e) {
      return { ok: false, error: "Decryption error: " + (e && e.message ? e.message : e) };
    }
  }

  global.MHFUDecryptor = {
    SIZE_PSP_ENC: SIZE_PSP_ENC,
    SIZE_PSP_DEC: SIZE_PSP_DEC,
    SIZE_SLOT: SIZE_SLOT,
    decryptBIN: decryptBIN,
    // exposed for tests / debugging only:
    _pspDecrypt: pspDecrypt,
    _gameDecrypt: gameDecrypt,
    _sha1: sha1,
    _AES: AES
  };
})(typeof window !== "undefined" ? window : globalThis);
/* >>> EMBEDDED SAVETOOLS DECRYPTOR  (END)  <<< */
