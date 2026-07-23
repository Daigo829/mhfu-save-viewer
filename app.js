(function () {
  "use strict";

  // ============================================================
  // MHFU Save Viewer — READ ONLY. Never writes or downloads.
  // ============================================================

  const EXPECT = 438528;   // decrypted MHP2G save size
  const PAIR   = 0xB4;     // smallest% slot = largest% slot + 0xB4
  const CACHE  = 0x67408;  // guild-card size display cache (31 crown families)

  // Auto-generated from offset maps 02/03 (in-game Monster List order) + crown thresholds.
  // n=name g=in-game# sub=is-subspecies sl=slain@ cp=captured@ lg=largest@ sm=smallest@
  // sz=has-size cap=capturable b=base-cm mi=small-crown% kg=big-crown%
  const DATA = [
    {n:"Felyne",g:1,sub:0,sl:0x425A,cp:0x403E,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Melynx",g:2,sub:0,sl:0x4276,cp:0x405A,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Shakalaka",g:3,sub:0,sl:0x42BA,cp:0x409E,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"King Shakalaka",g:4,sub:0,sl:0x42E6,cp:0x40CA,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Vespoid",g:5,sub:0,sl:0x426E,cp:0x4052,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Vespoid Queen",g:6,sub:0,sl:0x42E8,cp:0x40CC,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Hornetaur",g:7,sub:0,sl:0x4278,cp:0x405C,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Great Thunderbug",g:8,sub:0,sl:0x42B8,cp:0x409C,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Anteka",g:9,sub:0,sl:0x42D2,cp:0x40B6,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Popo",g:10,sub:0,sl:0x42D4,cp:0x40B8,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Kelbi",g:11,sub:0,sl:0x424E,cp:0x4032,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Mosswine",g:12,sub:0,sl:0x4250,cp:0x4034,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Aptonoth",g:13,sub:0,sl:0x4260,cp:0x4044,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Apceros",g:14,sub:0,sl:0x427A,cp:0x405E,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Giaprey",g:15,sub:0,sl:0x428E,cp:0x4072,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Giadrome",g:16,sub:0,sl:0x42E2,cp:0x40C6,lg:0x417A,sm:0x422E,sz:1,cap:1,b:738.4,mi:90,kg:123},
    {n:"Velociprey",g:17,sub:0,sl:0x4268,cp:0x404C,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Velocidrome",g:18,sub:0,sl:0x427E,cp:0x4062,lg:0x4116,sm:0x41CA,sz:1,cap:1,b:738.4,mi:90,kg:123},
    {n:"Genprey",g:19,sub:0,sl:0x4262,cp:0x4046,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Gendrome",g:20,sub:0,sl:0x4280,cp:0x4064,lg:0x4118,sm:0x41CC,sz:1,cap:1,b:732.1,mi:90,kg:123},
    {n:"Ioprey",g:21,sub:0,sl:0x4284,cp:0x4068,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Iodrome",g:22,sub:0,sl:0x4286,cp:0x406A,lg:0x411E,sm:0x41D2,sz:1,cap:1,b:774.6,mi:90,kg:136},
    {n:"Yian Kut-Ku",g:23,sub:0,sl:0x4254,cp:0x4038,lg:0x40EC,sm:0x41A0,sz:1,cap:1,b:919.8,mi:90,kg:122},
    {n:"Blue Yian Kut-Ku",g:23,sub:1,sl:0x4294,cp:0x4078,lg:0x412C,sm:0x41E0,sz:1,cap:1,b:919.8,mi:90,kg:122},
    {n:"Yian Garuga",g:24,sub:0,sl:0x4298,cp:0x407C,lg:0x4130,sm:0x41E4,sz:1,cap:1,b:1031.7,mi:91,kg:121},
    {n:"Yian Garuga (One-Eyed)",g:24,sub:1,sl:0x42E4,cp:0x40C8,lg:0x417C,sm:0x4230,sz:1,cap:1,b:1031.7,mi:91,kg:121},
    {n:"Gypceros",g:25,sub:0,sl:0x4270,cp:0x4054,lg:0x4108,sm:0x41BC,sz:1,cap:1,b:1013.7,mi:93,kg:125},
    {n:"Purple Gypceros",g:25,sub:1,sl:0x4296,cp:0x407A,lg:0x412E,sm:0x41E2,sz:1,cap:1,b:1013.7,mi:93,kg:125},
    {n:"Hypnocatrice",g:26,sub:0,sl:0x42EC,cp:0x40D0,lg:0x4184,sm:0x4238,sz:1,cap:1,b:834.9,mi:91,kg:121},
    {n:"Remobra",g:27,sub:0,sl:0x42C6,cp:0x40AA,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Rathian",g:28,sub:0,sl:0x424A,cp:0x402E,lg:0x40E2,sm:0x4196,sz:1,cap:1,b:1645.6,mi:93,kg:129},
    {n:"Pink Rathian",g:28,sub:1,sl:0x4292,cp:0x4076,lg:0x412A,sm:0x41DE,sz:1,cap:1,b:1645.6,mi:93,kg:129},
    {n:"Gold Rathian",g:28,sub:1,sl:0x429C,cp:0x4080,lg:0x4134,sm:0x41E8,sz:1,cap:1,b:1645.6,mi:93,kg:129},
    {n:"Rathalos",g:29,sub:0,sl:0x425E,cp:0x4042,lg:0x40F6,sm:0x41AA,sz:1,cap:1,b:1629.4,mi:90,kg:127},
    {n:"Azure Rathalos",g:29,sub:1,sl:0x429A,cp:0x407E,lg:0x4132,sm:0x41E6,sz:1,cap:1,b:1629.4,mi:90,kg:127},
    {n:"Silver Rathalos",g:29,sub:1,sl:0x42AA,cp:0x408E,lg:0x4142,sm:0x41F6,sz:1,cap:1,b:1629.4,mi:90,kg:127},
    {n:"Khezu",g:30,sub:0,sl:0x4266,cp:0x404A,lg:0x40FE,sm:0x41B2,sz:1,cap:1,b:873.2,mi:93,kg:135},
    {n:"Red Khezu",g:30,sub:1,sl:0x42A2,cp:0x4086,lg:0x413A,sm:0x41EE,sz:1,cap:1,b:873.2,mi:93,kg:135},
    {n:"Basarios",g:31,sub:0,sl:0x4274,cp:0x4058,lg:0x410C,sm:0x41C0,sz:1,cap:1,b:1297.6,mi:93,kg:129},
    {n:"Gravios",g:32,sub:0,sl:0x426A,cp:0x404E,lg:0x4102,sm:0x41B6,sz:1,cap:1,b:2099.9,mi:97,kg:135},
    {n:"Black Gravios",g:32,sub:1,sl:0x42A6,cp:0x408A,lg:0x413E,sm:0x41F2,sz:1,cap:1,b:2099.9,mi:97,kg:135},
    {n:"Monoblos",g:33,sub:0,sl:0x427C,cp:0x4060,lg:0x4114,sm:0x41C8,sz:1,cap:1,b:2004.2,mi:94,kg:127},
    {n:"White Monoblos",g:33,sub:1,sl:0x42A0,cp:0x4084,lg:0x4138,sm:0x41EC,sz:1,cap:1,b:2004.2,mi:94,kg:127},
    {n:"Diablos",g:34,sub:0,sl:0x4264,cp:0x4048,lg:0x40FC,sm:0x41B0,sz:1,cap:1,b:1993.4,mi:97,kg:139},
    {n:"Black Diablos",g:34,sub:1,sl:0x429E,cp:0x4082,lg:0x4136,sm:0x41EA,sz:1,cap:1,b:1993.4,mi:97,kg:139},
    {n:"Tigrex",g:35,sub:0,sl:0x42DE,cp:0x40C2,lg:0x4176,sm:0x422A,sz:1,cap:1,b:1735.3,mi:90,kg:123},
    {n:"Nargacuga",g:36,sub:0,sl:0x42EA,cp:0x40CE,lg:0x4182,sm:0x4236,sz:1,cap:1,b:1602.2,mi:90,kg:123},
    {n:"Akantor",g:37,sub:0,sl:0x42E0,cp:0x40C4,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Ukanlos",g:38,sub:0,sl:0x42F8,cp:0x40DC,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Cephalos",g:39,sub:0,sl:0x428C,cp:0x4070,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Cephadrome",g:40,sub:0,sl:0x4258,cp:0x403C,lg:0x40F0,sm:0x41A4,sz:1,cap:1,b:1538.3,mi:93,kg:122},
    {n:"Plesioth",g:41,sub:0,sl:0x4272,cp:0x4056,lg:0x410A,sm:0x41BE,sz:1,cap:1,b:2315.2,mi:97,kg:134},
    {n:"Green Plesioth",g:41,sub:1,sl:0x42A4,cp:0x4088,lg:0x413C,sm:0x41F0,sz:1,cap:1,b:2315.2,mi:97,kg:134},
    {n:"Lavasioth",g:42,sub:0,sl:0x42EE,cp:0x40D2,lg:0x4186,sm:0x423A,sz:1,cap:1,b:2223.2,mi:85,kg:116},
    {n:"Hermitaur",g:43,sub:0,sl:0x42CC,cp:0x40B0,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Daimyo Hermitaur",g:44,sub:0,sl:0x42A8,cp:0x408C,lg:0x4140,sm:0x41F4,sz:1,cap:1,b:1044,mi:88,kg:123},
    {n:"Plum Daimyo Hermitaur",g:44,sub:1,sl:0x42F4,cp:0x40D8,lg:0x418C,sm:0x4240,sz:1,cap:1,b:1044,mi:88,kg:123},
    {n:"Ceanataur",g:45,sub:0,sl:0x42DA,cp:0x40BE,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Shogun Ceanataur",g:46,sub:0,sl:0x42CE,cp:0x40B2,lg:0x4166,sm:0x421A,sz:1,cap:1,b:863,mi:94,kg:120},
    {n:"Terra Shogun Ceanataur",g:46,sub:1,sl:0x42F6,cp:0x40DA,lg:0x418E,sm:0x4242,sz:1,cap:1,b:863,mi:94,kg:120},
    {n:"Shen Gaoren",g:47,sub:0,sl:0x42B6,cp:0x409A,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Bullfango",g:48,sub:0,sl:0x4252,cp:0x4036,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Bulldrome",g:49,sub:0,sl:0x42D0,cp:0x40B4,lg:0x4168,sm:0x421C,sz:1,cap:1,b:566,mi:98,kg:130},
    {n:"Conga",g:50,sub:0,sl:0x42C4,cp:0x40A8,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Congalala",g:51,sub:0,sl:0x42B0,cp:0x4094,lg:0x4148,sm:0x41FC,sz:1,cap:1,b:984,mi:97,kg:125},
    {n:"Emerald Congalala",g:51,sub:1,sl:0x42F2,cp:0x40D6,lg:0x418A,sm:0x423E,sz:1,cap:1,b:984,mi:97,kg:125},
    {n:"Blango",g:52,sub:0,sl:0x42C2,cp:0x40A6,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Blangonga",g:53,sub:0,sl:0x42AE,cp:0x4092,lg:0x4146,sm:0x41FA,sz:1,cap:1,b:860,mi:99,kg:138},
    {n:"Copper Blangonga",g:53,sub:1,sl:0x42F0,cp:0x40D4,lg:0x4188,sm:0x423C,sz:1,cap:1,b:860,mi:99,kg:138},
    {n:"Rajang",g:54,sub:0,sl:0x42B2,cp:0x4096,lg:0x414A,sm:0x41FE,sz:1,cap:1,b:960,mi:105,kg:140},
    {n:"Golden Rajang",g:54,sub:1,sl:0x42FA,cp:0x40DE,lg:0x4192,sm:0x4246,sz:1,cap:1,b:960,mi:105,kg:140},
    {n:"Kirin",g:55,sub:0,sl:0x428A,cp:0x406E,lg:0x4122,sm:0x41D6,sz:1,cap:0,b:464.3,mi:97,kg:177},
    {n:"Kushala Daora",g:56,sub:0,sl:0x42B4,cp:0x4098,lg:0x414C,sm:0x4200,sz:1,cap:0,b:1577,mi:91,kg:120},
    {n:"Rusted Kushala Daora",g:56,sub:1,sl:0x42C0,cp:0x40A4,lg:0x4158,sm:0x420C,sz:1,cap:0,b:1577,mi:91,kg:120},
    {n:"Chameleos",g:57,sub:0,sl:0x42BE,cp:0x40A2,lg:0x4156,sm:0x420A,sz:1,cap:0,b:1744,mi:96,kg:141},
    {n:"Lunastra",g:58,sub:0,sl:0x42C8,cp:0x40AC,lg:0x4160,sm:0x4214,sz:1,cap:0,b:1740,mi:91,kg:121},
    {n:"Teostra",g:59,sub:0,sl:0x42CA,cp:0x40AE,lg:0x4162,sm:0x4216,sz:1,cap:0,b:1740,mi:88,kg:125},
    {n:"Lao-Shan Lung (base)",g:60,sub:0,sl:0x4256,cp:0x403A,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Ashen Lao-Shan Lung",g:60,sub:1,sl:0x42AC,cp:0x4090,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Yama Tsukami",g:61,sub:0,sl:0x42BC,cp:0x40A0,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Black Fatalis",g:62,sub:0,sl:0x424C,cp:0x4030,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"Crimson Fatalis",g:62,sub:1,sl:0x4290,cp:0x4074,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
    {n:"White Fatalis",g:62,sub:1,sl:0x42D6,cp:0x40BA,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0},
  ];

  // All 90 internal array slots, for the Advanced (debug) panel.
  const SLOTS = [
    {id:1,label:"(unused)",cp:0x402C,lg:0x40E0,sm:0x4194,sl:0x4248},
    {id:2,label:"Rathian",cp:0x402E,lg:0x40E2,sm:0x4196,sl:0x424A},
    {id:3,label:"Black Fatalis",cp:0x4030,lg:0x40E4,sm:0x4198,sl:0x424C},
    {id:4,label:"Kelbi",cp:0x4032,lg:0x40E6,sm:0x419A,sl:0x424E},
    {id:5,label:"Mosswine",cp:0x4034,lg:0x40E8,sm:0x419C,sl:0x4250},
    {id:6,label:"Bullfango",cp:0x4036,lg:0x40EA,sm:0x419E,sl:0x4252},
    {id:7,label:"Yian Kut-Ku",cp:0x4038,lg:0x40EC,sm:0x41A0,sl:0x4254},
    {id:8,label:"Lao-Shan Lung (base)",cp:0x403A,lg:0x40EE,sm:0x41A2,sl:0x4256},
    {id:9,label:"Cephadrome",cp:0x403C,lg:0x40F0,sm:0x41A4,sl:0x4258},
    {id:10,label:"Felyne",cp:0x403E,lg:0x40F2,sm:0x41A6,sl:0x425A},
    {id:11,label:"(unused)",cp:0x4040,lg:0x40F4,sm:0x41A8,sl:0x425C},
    {id:12,label:"Rathalos",cp:0x4042,lg:0x40F6,sm:0x41AA,sl:0x425E},
    {id:13,label:"Aptonoth",cp:0x4044,lg:0x40F8,sm:0x41AC,sl:0x4260},
    {id:14,label:"Genprey",cp:0x4046,lg:0x40FA,sm:0x41AE,sl:0x4262},
    {id:15,label:"Diablos",cp:0x4048,lg:0x40FC,sm:0x41B0,sl:0x4264},
    {id:16,label:"Khezu",cp:0x404A,lg:0x40FE,sm:0x41B2,sl:0x4266},
    {id:17,label:"Velociprey",cp:0x404C,lg:0x4100,sm:0x41B4,sl:0x4268},
    {id:18,label:"Gravios",cp:0x404E,lg:0x4102,sm:0x41B6,sl:0x426A},
    {id:19,label:"(unused)",cp:0x4050,lg:0x4104,sm:0x41B8,sl:0x426C},
    {id:20,label:"Vespoid",cp:0x4052,lg:0x4106,sm:0x41BA,sl:0x426E},
    {id:21,label:"Gypceros",cp:0x4054,lg:0x4108,sm:0x41BC,sl:0x4270},
    {id:22,label:"Plesioth",cp:0x4056,lg:0x410A,sm:0x41BE,sl:0x4272},
    {id:23,label:"Basarios",cp:0x4058,lg:0x410C,sm:0x41C0,sl:0x4274},
    {id:24,label:"Melynx",cp:0x405A,lg:0x410E,sm:0x41C2,sl:0x4276},
    {id:25,label:"Hornetaur",cp:0x405C,lg:0x4110,sm:0x41C4,sl:0x4278},
    {id:26,label:"Apceros",cp:0x405E,lg:0x4112,sm:0x41C6,sl:0x427A},
    {id:27,label:"Monoblos",cp:0x4060,lg:0x4114,sm:0x41C8,sl:0x427C},
    {id:28,label:"Velocidrome",cp:0x4062,lg:0x4116,sm:0x41CA,sl:0x427E},
    {id:29,label:"Gendrome",cp:0x4064,lg:0x4118,sm:0x41CC,sl:0x4280},
    {id:30,label:"UNKNOWN-1009 (not on list)",cp:0x4066,lg:0x411A,sm:0x41CE,sl:0x4282},
    {id:31,label:"Ioprey",cp:0x4068,lg:0x411C,sm:0x41D0,sl:0x4284},
    {id:32,label:"Iodrome",cp:0x406A,lg:0x411E,sm:0x41D2,sl:0x4286},
    {id:33,label:"(unused)",cp:0x406C,lg:0x4120,sm:0x41D4,sl:0x4288},
    {id:34,label:"Kirin",cp:0x406E,lg:0x4122,sm:0x41D6,sl:0x428A},
    {id:35,label:"Cephalos",cp:0x4070,lg:0x4124,sm:0x41D8,sl:0x428C},
    {id:36,label:"Giaprey",cp:0x4072,lg:0x4126,sm:0x41DA,sl:0x428E},
    {id:37,label:"Crimson Fatalis",cp:0x4074,lg:0x4128,sm:0x41DC,sl:0x4290},
    {id:38,label:"Pink Rathian",cp:0x4076,lg:0x412A,sm:0x41DE,sl:0x4292},
    {id:39,label:"Blue Yian Kut-Ku",cp:0x4078,lg:0x412C,sm:0x41E0,sl:0x4294},
    {id:40,label:"Purple Gypceros",cp:0x407A,lg:0x412E,sm:0x41E2,sl:0x4296},
    {id:41,label:"Yian Garuga",cp:0x407C,lg:0x4130,sm:0x41E4,sl:0x4298},
    {id:42,label:"Azure Rathalos",cp:0x407E,lg:0x4132,sm:0x41E6,sl:0x429A},
    {id:43,label:"Gold Rathian",cp:0x4080,lg:0x4134,sm:0x41E8,sl:0x429C},
    {id:44,label:"Black Diablos",cp:0x4082,lg:0x4136,sm:0x41EA,sl:0x429E},
    {id:45,label:"White Monoblos",cp:0x4084,lg:0x4138,sm:0x41EC,sl:0x42A0},
    {id:46,label:"Red Khezu",cp:0x4086,lg:0x413A,sm:0x41EE,sl:0x42A2},
    {id:47,label:"Green Plesioth",cp:0x4088,lg:0x413C,sm:0x41F0,sl:0x42A4},
    {id:48,label:"Black Gravios",cp:0x408A,lg:0x413E,sm:0x41F2,sl:0x42A6},
    {id:49,label:"Daimyo Hermitaur",cp:0x408C,lg:0x4140,sm:0x41F4,sl:0x42A8},
    {id:50,label:"Silver Rathalos",cp:0x408E,lg:0x4142,sm:0x41F6,sl:0x42AA},
    {id:51,label:"Ashen Lao-Shan Lung",cp:0x4090,lg:0x4144,sm:0x41F8,sl:0x42AC},
    {id:52,label:"Blangonga",cp:0x4092,lg:0x4146,sm:0x41FA,sl:0x42AE},
    {id:53,label:"Congalala",cp:0x4094,lg:0x4148,sm:0x41FC,sl:0x42B0},
    {id:54,label:"Rajang",cp:0x4096,lg:0x414A,sm:0x41FE,sl:0x42B2},
    {id:55,label:"Kushala Daora",cp:0x4098,lg:0x414C,sm:0x4200,sl:0x42B4},
    {id:56,label:"Shen Gaoren",cp:0x409A,lg:0x414E,sm:0x4202,sl:0x42B6},
    {id:57,label:"Great Thunderbug",cp:0x409C,lg:0x4150,sm:0x4204,sl:0x42B8},
    {id:58,label:"Shakalaka",cp:0x409E,lg:0x4152,sm:0x4206,sl:0x42BA},
    {id:59,label:"Yama Tsukami",cp:0x40A0,lg:0x4154,sm:0x4208,sl:0x42BC},
    {id:60,label:"Chameleos",cp:0x40A2,lg:0x4156,sm:0x420A,sl:0x42BE},
    {id:61,label:"Rusted Kushala Daora",cp:0x40A4,lg:0x4158,sm:0x420C,sl:0x42C0},
    {id:62,label:"Blango",cp:0x40A6,lg:0x415A,sm:0x420E,sl:0x42C2},
    {id:63,label:"Conga",cp:0x40A8,lg:0x415C,sm:0x4210,sl:0x42C4},
    {id:64,label:"Remobra",cp:0x40AA,lg:0x415E,sm:0x4212,sl:0x42C6},
    {id:65,label:"Lunastra",cp:0x40AC,lg:0x4160,sm:0x4214,sl:0x42C8},
    {id:66,label:"Teostra",cp:0x40AE,lg:0x4162,sm:0x4216,sl:0x42CA},
    {id:67,label:"Hermitaur",cp:0x40B0,lg:0x4164,sm:0x4218,sl:0x42CC},
    {id:68,label:"Shogun Ceanataur",cp:0x40B2,lg:0x4166,sm:0x421A,sl:0x42CE},
    {id:69,label:"Bulldrome",cp:0x40B4,lg:0x4168,sm:0x421C,sl:0x42D0},
    {id:70,label:"Anteka",cp:0x40B6,lg:0x416A,sm:0x421E,sl:0x42D2},
    {id:71,label:"Popo",cp:0x40B8,lg:0x416C,sm:0x4220,sl:0x42D4},
    {id:72,label:"White Fatalis",cp:0x40BA,lg:0x416E,sm:0x4222,sl:0x42D6},
    {id:73,label:"(unused)",cp:0x40BC,lg:0x4170,sm:0x4224,sl:0x42D8},
    {id:74,label:"Ceanataur",cp:0x40BE,lg:0x4172,sm:0x4226,sl:0x42DA},
    {id:75,label:"(unused)",cp:0x40C0,lg:0x4174,sm:0x4228,sl:0x42DC},
    {id:76,label:"Tigrex",cp:0x40C2,lg:0x4176,sm:0x422A,sl:0x42DE},
    {id:77,label:"Akantor",cp:0x40C4,lg:0x4178,sm:0x422C,sl:0x42E0},
    {id:78,label:"Giadrome",cp:0x40C6,lg:0x417A,sm:0x422E,sl:0x42E2},
    {id:79,label:"Yian Garuga (One-Eyed)",cp:0x40C8,lg:0x417C,sm:0x4230,sl:0x42E4},
    {id:80,label:"King Shakalaka",cp:0x40CA,lg:0x417E,sm:0x4232,sl:0x42E6},
    {id:81,label:"Vespoid Queen",cp:0x40CC,lg:0x4180,sm:0x4234,sl:0x42E8},
    {id:82,label:"Nargacuga",cp:0x40CE,lg:0x4182,sm:0x4236,sl:0x42EA},
    {id:83,label:"Hypnocatrice",cp:0x40D0,lg:0x4184,sm:0x4238,sl:0x42EC},
    {id:84,label:"Lavasioth",cp:0x40D2,lg:0x4186,sm:0x423A,sl:0x42EE},
    {id:85,label:"Copper Blangonga",cp:0x40D4,lg:0x4188,sm:0x423C,sl:0x42F0},
    {id:86,label:"Emerald Congalala",cp:0x40D6,lg:0x418A,sm:0x423E,sl:0x42F2},
    {id:87,label:"Plum Daimyo Hermitaur",cp:0x40D8,lg:0x418C,sm:0x4240,sl:0x42F4},
    {id:88,label:"Terra Shogun Ceanataur",cp:0x40DA,lg:0x418E,sm:0x4242,sl:0x42F6},
    {id:89,label:"Ukanlos",cp:0x40DC,lg:0x4190,sm:0x4244,sl:0x42F8},
    {id:90,label:"Golden Rajang",cp:0x40DE,lg:0x4192,sm:0x4246,sl:0x42FA},
  ];

  // Group DATA into families: each parent row + its subspecies rows.
  const FAMS = (function () {
    const fams = []; let cur = null;
    DATA.forEach(r => { if (!r.sub) { cur = { rows: [r] }; fams.push(cur); } else cur.rows.push(r); });
    fams.forEach(f => { f.hasSize = f.rows.some(r => r.sz === 1); });
    return fams;
  })();

  // ---- state -----------------------------------------------------------
  let view = null;                 // DataView over the loaded save (read only)
  const openFams = new Set();      // expanded family indices (into FAMS)
  let filterMode = "all";          // "all" | "crown"
  let showSizeCols = true;
  let showSlots = false;
  const $ = (id) => document.getElementById(id);

  // ---- helpers ---------------------------------------------------------
  function setStatus(msg, kind) { const el = $("status"); el.textContent = msg; el.className = "status" + (kind ? " " + kind : ""); }
  const u16 = (o) => view.getUint16(o, true);
  const cm  = (base, pct) => Math.round(base * pct / 100 * 10) / 10;
  const fmt = (v) => v.toFixed(1);
  const hex = (o) => "0x" + o.toString(16).toUpperCase();
  const dash = () => '<span class="dash">----</span>';

  function looksLikeText(dv) { const c0 = dv.getUint8(0), h0 = dv.getUint8(1); return c0 >= 0x20 && c0 <= 0x7e && h0 === 0x00; }
  function readName(dv) { let nm = ""; for (let o = 0; o < 32; o += 2) { const ch = dv.getUint16(o, true); if (ch === 0) break; nm += String.fromCharCode(ch); } return nm; }

  // Read a whole family off the save: per-row counts + sizes, and family-level
  // crown state (which record surfaces min/max, and whether a crown is earned).
  function readFam(fam) {
    const rows = fam.rows.map(r => {
      const slain = u16(r.sl), cap = u16(r.cp), hasSize = r.sz === 1;
      const S = hasSize ? u16(r.sm) : 0, L = hasSize ? u16(r.lg) : 0;
      const present = hasSize && !(S === 0 && L === 0);
      return { r, slain, cap, total: slain + cap, S, L, hasSize, present };
    });
    let minIdx = -1, maxIdx = -1;
    rows.forEach((x, i) => { if (!x.present) return; if (minIdx < 0 || x.S < rows[minIdx].S) minIdx = i; if (maxIdx < 0 || x.L > rows[maxIdx].L) maxIdx = i; });
    const szRow = fam.rows.find(r => r.sz === 1);
    const mi = szRow ? szRow.mi : 0, kg = szRow ? szRow.kg : 0;
    const smallCrown = minIdx >= 0 && rows[minIdx].S <= mi;
    const kingCrown  = maxIdx >= 0 && rows[maxIdx].L >= kg;
    const hunted = rows.reduce((a, x) => a + x.total, 0);
    return { rows, minIdx, maxIdx, smallCrown, kingCrown, mi, kg, hunted };
  }

  // ---- cell renderers --------------------------------------------------
  function minSizeCell(fx, i, x) {
    if (!x.hasSize) return dash();
    if (!x.present) return '<span class="muted">&mdash;</span>';
    const crown = x.S <= fx.mi ? " sz-sc" : "";
    return `<span class="szval${crown}">${x.S}% <span class="muted">${fmt(cm(x.r.b, x.S))}cm</span></span>`;
  }
  function maxSizeCell(fx, i, x) {
    if (!x.hasSize) return dash();
    if (!x.present) return '<span class="muted">&mdash;</span>';
    const crown = x.L >= fx.kg ? " sz-bc" : "";
    return `<span class="szval${crown}">${x.L}% <span class="muted">${fmt(cm(x.r.b, x.L))}cm</span></span>`;
  }
  function crownBadges(fam, fx, i, x) {
    if (!x.hasSize) return dash();
    if (!x.present) return '<span class="badge norec">no record</span>';
    const multi = fam.rows.length > 1;
    const isMin = i === fx.minIdx, isMax = i === fx.maxIdx;
    const out = [];
    if (isMin && fx.smallCrown) out.push('<span class="badge sc">small crown</span>');
    if (isMax && fx.kingCrown)  out.push('<span class="badge bc">big crown</span>');
    if (multi && isMin && !fx.smallCrown) out.push('<span class="badge oncard">on card</span>');
    if (multi && isMax && !fx.kingCrown)  out.push('<span class="badge oncard">on card</span>');
    if (!isMin && x.S <= fx.mi) out.push('<span class="badge sch">hidden small crown</span>');
    if (!isMax && x.L >= fx.kg) out.push('<span class="badge bch">hidden big crown</span>');
    return out.join(" ") || '<span class="dash">none</span>';
  }

  function recRow(fam, fx, i, fi, open) {
    const r = fam.rows[i], x = fx.rows[i];
    const capCell = r.cap ? String(x.cap) : dash();
    const minC = minSizeCell(fx, i, x), maxC = maxSizeCell(fx, i, x), crownC = crownBadges(fam, fx, i, x);
    if (i === 0) {
      const hasSub = fam.rows.length > 1;
      const caret  = hasSub ? '<span class="caret">&#9656;</span>' : "";
      const subc   = hasSub ? `<span class="subcount">+${fam.rows.length - 1} sub</span>` : "";
      const fh     = hasSub ? `<span class="fhunt" title="family total — what the guild card counts as Hunted">&#931; ${fx.hunted} hunted</span>` : "";
      return `<tr class="mrow base${open ? " open" : ""}${hasSub ? " hassub" : ""}" data-fam="${fi}">
        <td>${caret}</td>
        <td class="cardno">${r.g}</td>
        <td class="mname">${r.n}${subc}${fh}</td>
        <td class="num">${x.slain}</td>
        <td class="num">${capCell}</td>
        <td class="num">${x.total}</td>
        <td class="num szcol">${minC}</td>
        <td class="num szcol">${maxC}</td>
        <td class="szcol crowncell">${crownC}</td>
      </tr>`;
    }
    return `<tr class="subrow${open ? "" : " hidden"}" data-fam="${fi}">
      <td></td>
      <td class="cardno"></td>
      <td class="mname sub">${r.n}</td>
      <td class="num">${x.slain}</td>
      <td class="num">${capCell}</td>
      <td class="num">${x.total}</td>
      <td class="num szcol">${minC}</td>
      <td class="num szcol">${maxC}</td>
      <td class="szcol crowncell">${crownC}</td>
    </tr>`;
  }

  function renderTable() {
    if (!view) return;
    $("montbl").classList.toggle("hide-size", !showSizeCols);
    const rows = [];
    FAMS.forEach((fam, fi) => {
      if (filterMode === "crown" && !fam.hasSize) return;
      const fx = readFam(fam);
      const open = openFams.has(fi);
      for (let i = 0; i < fam.rows.length; i++) rows.push(recRow(fam, fx, i, fi, open));
    });
    $("tbody").innerHTML = rows.join("");
    document.querySelectorAll(".montbl tr.mrow.hassub").forEach(tr =>
      tr.addEventListener("click", () => {
        const fi = +tr.dataset.fam;
        if (openFams.has(fi)) openFams.delete(fi); else openFams.add(fi);
        renderTable();
      }));
  }

  // ---- advanced: raw 90-slot table -------------------------------------
  function renderSlots() {
    const wrap = $("advWrap");
    if (!wrap) return;
    if (!showSlots || !view) { wrap.classList.add("hidden"); $("advBody").innerHTML = ""; return; }
    wrap.classList.remove("hidden");
    const cell = (o) => `${hex(o)} <span class="muted">${u16(o)}</span>`;
    $("advBody").innerHTML = SLOTS.map(s => {
      const dead = /unused|UNKNOWN/i.test(s.label);
      return `<tr class="${dead ? "slot-dead" : ""}">
        <td class="num">${s.id}</td><td>${s.label}</td>
        <td class="num mono">${cell(s.cp)}</td><td class="num mono">${cell(s.lg)}</td>
        <td class="num mono">${cell(s.sm)}</td><td class="num mono">${cell(s.sl)}</td>
      </tr>`;
    }).join("");
  }

  // ---- collapse / expand + controls ------------------------------------
  function famsWithSubs() { const a = []; FAMS.forEach((f, i) => { if (f.rows.length > 1) a.push(i); }); return a; }
  function setDefaultOpen() { openFams.clear(); famsWithSubs().forEach(i => openFams.add(i)); }
  function initControls() {
    const on = (id, ev, fn) => { const el = $(id); if (el) el.addEventListener(ev, fn); };
    on("expandAll", "click", () => { openFams.clear(); famsWithSubs().forEach(i => openFams.add(i)); renderTable(); });
    on("collapseAll", "click", () => { openFams.clear(); renderTable(); });
    on("filterMode", "change", e => { filterMode = e.target.value; renderTable(); });
    on("showSize", "change", e => { showSizeCols = e.target.checked; renderTable(); });
    on("showSlots", "change", e => { showSlots = e.target.checked; renderSlots(); });
  }

  // ---- load (read only) ------------------------------------------------
  function loadBuffer(buf, name) {
    if (buf.byteLength !== EXPECT) {
      setStatus(`Rejected: ${buf.byteLength.toLocaleString()} bytes, expected ${EXPECT.toLocaleString()}. Not a decrypted MHP2G save.`, "bad");
      $("main").classList.add("hidden"); return;
    }
    const dv = new DataView(buf);
    if (!looksLikeText(dv)) {
      setStatus("Rejected: file looks still-encrypted. Decrypt it first (PPSSPP / SaveTools).", "bad");
      $("main").classList.add("hidden"); return;
    }
    view = dv;
    setDefaultOpen();
    $("main").classList.remove("hidden");
    $("charname").textContent = readName(dv) || "(unnamed)";
    renderTable();
    renderSlots();
    setStatus(`Loaded "${readName(dv)}" — read-only, your file is untouched.`, "ok");
  }

  // ---- tabs ------------------------------------------------------------
  function initTabs() {
    document.querySelectorAll(".tab").forEach(btn =>
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === btn));
        const t = btn.dataset.tab;
        document.querySelectorAll(".tabpane").forEach(p => p.classList.toggle("hidden", p.id !== "pane-" + t));
      }));
  }

  // ---- file wiring -----------------------------------------------------
  function handleFile(file) {
    const r = new FileReader();
    r.onload = () => loadBuffer(r.result, file.name);
    r.onerror = () => setStatus("Could not read the file.", "bad");
    r.readAsArrayBuffer(file);
  }
  const drop = $("drop"), fileInput = $("file");
  drop.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
  ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("hover"); }));
  ["dragleave", "drop"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove("hover"); }));
  drop.addEventListener("drop", ev => { const f = ev.dataTransfer.files[0]; if (f) handleFile(f); });

  initTabs();
  initControls();
})();
