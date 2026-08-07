/* MHFU Save Viewer — v0.9  (READ ONLY — never writes or downloads; in-browser decrypt via decryptor.js) */
(function () {
  "use strict";

  const EXPECT = 438528;   // decrypted MHP2G save size

  // n=name g=in-game# sub=is-subspecies sl=slain@ cp=captured@ lg=largest@ sm=smallest@
  // sz=has-size cap=capturable b=base-cm mi=small-crown% kg=big-crown% gmn/gmx=game min/max%
  // bold=1 forces the row to render like a main species (Fatalis variants, Ashen Lao-Shan).
  const DATA = [
    {n:"Felyne",g:1,sub:0,sl:0x425A,cp:0x403E,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Melynx",g:2,sub:0,sl:0x4276,cp:0x405A,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Shakalaka",g:3,sub:0,sl:0x42BA,cp:0x409E,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"King Shakalaka",g:4,sub:0,sl:0x42E6,cp:0x40CA,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Vespoid",g:5,sub:0,sl:0x426E,cp:0x4052,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Vespoid Queen",g:6,sub:0,sl:0x42E8,cp:0x40CC,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Hornetaur",g:7,sub:0,sl:0x4278,cp:0x405C,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Great Thunderbug",g:8,sub:0,sl:0x42B8,cp:0x409C,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Anteka",g:9,sub:0,sl:0x42D2,cp:0x40B6,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Popo",g:10,sub:0,sl:0x42D4,cp:0x40B8,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Kelbi",g:11,sub:0,sl:0x424E,cp:0x4032,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Mosswine",g:12,sub:0,sl:0x4250,cp:0x4034,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Aptonoth",g:13,sub:0,sl:0x4260,cp:0x4044,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Apceros",g:14,sub:0,sl:0x427A,cp:0x405E,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Giaprey",g:15,sub:0,sl:0x428E,cp:0x4072,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Giadrome",g:16,sub:0,sl:0x42E2,cp:0x40C6,lg:0x417A,sm:0x422E,sz:1,cap:1,b:738.4,mi:90,kg:123,gmn:88,gmx:135},
    {n:"Velociprey",g:17,sub:0,sl:0x4268,cp:0x404C,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Velocidrome",g:18,sub:0,sl:0x427E,cp:0x4062,lg:0x4116,sm:0x41CA,sz:1,cap:1,b:738.4,mi:90,kg:123,gmn:88,gmx:130},
    {n:"Genprey",g:19,sub:0,sl:0x4262,cp:0x4046,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Gendrome",g:20,sub:0,sl:0x4280,cp:0x4064,lg:0x4118,sm:0x41CC,sz:1,cap:1,b:732.1,mi:90,kg:123,gmn:89,gmx:131},
    {n:"Ioprey",g:21,sub:0,sl:0x4284,cp:0x4068,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Iodrome",g:22,sub:0,sl:0x4286,cp:0x406A,lg:0x411E,sm:0x41D2,sz:1,cap:1,b:774.6,mi:90,kg:136,gmn:89,gmx:145},
    {n:"Yian Kut-Ku",g:23,sub:0,sl:0x4254,cp:0x4038,lg:0x40EC,sm:0x41A0,sz:1,cap:1,b:919.8,mi:90,kg:122,gmn:50,gmx:130},
    {n:"Blue Yian Kut-Ku",g:23,sub:1,sl:0x4294,cp:0x4078,lg:0x412C,sm:0x41E0,sz:1,cap:1,b:919.8,mi:90,kg:122,gmn:86,gmx:131,vs:'diff'},
    {n:"Yian Garuga",g:24,sub:0,sl:0x4298,cp:0x407C,lg:0x4130,sm:0x41E4,sz:1,cap:1,b:1031.7,mi:91,kg:121,gmn:86,gmx:130},
    {n:"Yian Garuga (One-Eyed)",g:24,sub:1,sl:0x42E4,cp:0x40C8,lg:0x417C,sm:0x4230,sz:1,cap:1,b:1031.7,mi:91,kg:121,gmn:86,gmx:130,vs:'same'},
    {n:"Gypceros",g:25,sub:0,sl:0x4270,cp:0x4054,lg:0x4108,sm:0x41BC,sz:1,cap:1,b:1013.7,mi:93,kg:125,gmn:88,gmx:133},
    {n:"Purple Gypceros",g:25,sub:1,sl:0x4296,cp:0x407A,lg:0x412E,sm:0x41E2,sz:1,cap:1,b:1013.7,mi:93,kg:125,gmn:89,gmx:135,vs:'diff'},
    {n:"Hypnocatrice",g:26,sub:0,sl:0x42EC,cp:0x40D0,lg:0x4184,sm:0x4238,sz:1,cap:1,b:834.9,mi:91,kg:121,gmn:88,gmx:141},
    {n:"Remobra",g:27,sub:0,sl:0x42C6,cp:0x40AA,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Rathian",g:28,sub:0,sl:0x424A,cp:0x402E,lg:0x40E2,sm:0x4196,sz:1,cap:1,b:1645.6,mi:93,kg:129,gmn:88,gmx:131},
    {n:"Pink Rathian",g:28,sub:1,sl:0x4292,cp:0x4076,lg:0x412A,sm:0x41DE,sz:1,cap:1,b:1645.6,mi:93,kg:129,gmn:89,gmx:140,vs:'diff'},
    {n:"Gold Rathian",g:28,sub:1,sl:0x429C,cp:0x4080,lg:0x4134,sm:0x41E8,sz:1,cap:1,b:1645.6,mi:93,kg:129,gmn:91,gmx:140,vs:'diff'},
    {n:"Rathalos",g:29,sub:0,sl:0x425E,cp:0x4042,lg:0x40F6,sm:0x41AA,sz:1,cap:1,b:1629.4,mi:90,kg:127,gmn:88,gmx:135},
    {n:"Azure Rathalos",g:29,sub:1,sl:0x429A,cp:0x407E,lg:0x4132,sm:0x41E6,sz:1,cap:1,b:1629.4,mi:90,kg:127,gmn:88,gmx:140,vs:'diff'},
    {n:"Silver Rathalos",g:29,sub:1,sl:0x42AA,cp:0x408E,lg:0x4142,sm:0x41F6,sz:1,cap:1,b:1629.4,mi:90,kg:127,gmn:91,gmx:140,vs:'diff'},
    {n:"Khezu",g:30,sub:0,sl:0x4266,cp:0x404A,lg:0x40FE,sm:0x41B2,sz:1,cap:1,b:873.2,mi:93,kg:135,gmn:50,gmx:138},
    {n:"Red Khezu",g:30,sub:1,sl:0x42A2,cp:0x4086,lg:0x413A,sm:0x41EE,sz:1,cap:1,b:873.2,mi:93,kg:135,gmn:91,gmx:138,vs:'diff'},
    {n:"Basarios",g:31,sub:0,sl:0x4274,cp:0x4058,lg:0x410C,sm:0x41C0,sz:1,cap:1,b:1297.6,mi:93,kg:129,gmn:89,gmx:133},
    {n:"Gravios",g:32,sub:0,sl:0x426A,cp:0x404E,lg:0x4102,sm:0x41B6,sz:1,cap:1,b:2099.9,mi:97,kg:135,gmn:94,gmx:141},
    {n:"Black Gravios",g:32,sub:1,sl:0x42A6,cp:0x408A,lg:0x413E,sm:0x41F2,sz:1,cap:1,b:2099.9,mi:97,kg:135,gmn:93,gmx:143,vs:'diff'},
    {n:"Monoblos",g:33,sub:0,sl:0x427C,cp:0x4060,lg:0x4114,sm:0x41C8,sz:1,cap:1,b:2004.2,mi:94,kg:127,gmn:93,gmx:140},
    {n:"White Monoblos",g:33,sub:1,sl:0x42A0,cp:0x4084,lg:0x4138,sm:0x41EC,sz:1,cap:1,b:2004.2,mi:94,kg:127,gmn:93,gmx:140,vs:'same'},
    {n:"Diablos",g:34,sub:0,sl:0x4264,cp:0x4048,lg:0x40FC,sm:0x41B0,sz:1,cap:1,b:1993.4,mi:97,kg:139,gmn:96,gmx:154},
    {n:"Black Diablos",g:34,sub:1,sl:0x429E,cp:0x4082,lg:0x4136,sm:0x41EA,sz:1,cap:1,b:1993.4,mi:97,kg:139,gmn:95,gmx:141,vs:'diff'},
    {n:"Tigrex",g:35,sub:0,sl:0x42DE,cp:0x40C2,lg:0x4176,sm:0x422A,sz:1,cap:1,b:1735.3,mi:90,kg:123,gmn:88,gmx:138},
    {n:"Nargacuga",g:36,sub:0,sl:0x42EA,cp:0x40CE,lg:0x4182,sm:0x4236,sz:1,cap:1,b:1602.2,mi:90,kg:123,gmn:86,gmx:131},
    {n:"Akantor",g:37,sub:0,sl:0x42E0,cp:0x40C4,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Ukanlos",g:38,sub:0,sl:0x42F8,cp:0x40DC,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Cephalos",g:39,sub:0,sl:0x428C,cp:0x4070,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Cephadrome",g:40,sub:0,sl:0x4258,cp:0x403C,lg:0x40F0,sm:0x41A4,sz:1,cap:1,b:1538.3,mi:93,kg:122,gmn:89,gmx:131},
    {n:"Plesioth",g:41,sub:0,sl:0x4272,cp:0x4056,lg:0x410A,sm:0x41BE,sz:1,cap:1,b:2315.2,mi:97,kg:134,gmn:93,gmx:140},
    {n:"Green Plesioth",g:41,sub:1,sl:0x42A4,cp:0x4088,lg:0x413C,sm:0x41F0,sz:1,cap:1,b:2315.2,mi:97,kg:134,gmn:93,gmx:140,vs:'same'},
    {n:"Lavasioth",g:42,sub:0,sl:0x42EE,cp:0x40D2,lg:0x4186,sm:0x423A,sz:1,cap:1,b:2223.2,mi:85,kg:116,gmn:81,gmx:128},
    {n:"Hermitaur",g:43,sub:0,sl:0x42CC,cp:0x40B0,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Daimyo Hermitaur",g:44,sub:0,sl:0x42A8,cp:0x408C,lg:0x4140,sm:0x41F4,sz:1,cap:1,b:1044,mi:88,kg:123,gmn:85,gmx:127},
    {n:"Plum Daimyo Hermitaur",g:44,sub:1,sl:0x42F4,cp:0x40D8,lg:0x418C,sm:0x4240,sz:1,cap:1,b:1044,mi:88,kg:123,gmn:85,gmx:127,vs:'same'},
    {n:"Ceanataur",g:45,sub:0,sl:0x42DA,cp:0x40BE,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Shogun Ceanataur",g:46,sub:0,sl:0x42CE,cp:0x40B2,lg:0x4166,sm:0x421A,sz:1,cap:1,b:863,mi:94,kg:120,gmn:86,gmx:150},
    {n:"Terra Shogun Ceanataur",g:46,sub:1,sl:0x42F6,cp:0x40DA,lg:0x418E,sm:0x4242,sz:1,cap:1,b:863,mi:94,kg:120,gmn:86,gmx:130,vs:'diff'},
    {n:"Shen Gaoren",g:47,sub:0,sl:0x42B6,cp:0x409A,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Bullfango",g:48,sub:0,sl:0x4252,cp:0x4036,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Bulldrome",g:49,sub:0,sl:0x42D0,cp:0x40B4,lg:0x4168,sm:0x421C,sz:1,cap:1,b:566,mi:98,kg:130,gmn:89,gmx:210},
    {n:"Conga",g:50,sub:0,sl:0x42C4,cp:0x40A8,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Congalala",g:51,sub:0,sl:0x42B0,cp:0x4094,lg:0x4148,sm:0x41FC,sz:1,cap:1,b:984,mi:97,kg:125,gmn:93,gmx:140},
    {n:"Emerald Congalala",g:51,sub:1,sl:0x42F2,cp:0x40D6,lg:0x418A,sm:0x423E,sz:1,cap:1,b:984,mi:97,kg:125,gmn:95,gmx:140,vs:'diff'},
    {n:"Blango",g:52,sub:0,sl:0x42C2,cp:0x40A6,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Blangonga",g:53,sub:0,sl:0x42AE,cp:0x4092,lg:0x4146,sm:0x41FA,sz:1,cap:1,b:860,mi:99,kg:138,gmn:96,gmx:143},
    {n:"Copper Blangonga",g:53,sub:1,sl:0x42F0,cp:0x40D4,lg:0x4188,sm:0x423C,sz:1,cap:1,b:860,mi:99,kg:138,gmn:93,gmx:145,vs:'diff'},
    {n:"Rajang",g:54,sub:0,sl:0x42B2,cp:0x4096,lg:0x414A,sm:0x41FE,sz:1,cap:1,b:960,mi:105,kg:140,gmn:100,gmx:162},
    {n:"Golden Rajang",g:54,sub:1,sl:0x42FA,cp:0x40DE,lg:0x4192,sm:0x4246,sz:1,cap:1,b:960,mi:105,kg:140,gmn:100,gmx:150,vs:'diff'},
    {n:"Kirin",g:55,sub:0,sl:0x428A,cp:0x406E,lg:0x4122,sm:0x41D6,sz:1,cap:0,b:464.3,mi:97,kg:177,gmn:95,gmx:200},
    {n:"Kushala Daora",g:56,sub:0,sl:0x42B4,cp:0x4098,lg:0x414C,sm:0x4200,sz:1,cap:0,b:1577,mi:91,kg:120,gmn:90,gmx:138},
    {n:"Rusted Kushala Daora",g:56,sub:1,sl:0x42C0,cp:0x40A4,lg:0x4158,sm:0x420C,sz:1,cap:0,b:1577,mi:91,kg:120,gmn:88,gmx:131,vs:'diff'},
    {n:"Chameleos",g:57,sub:0,sl:0x42BE,cp:0x40A2,lg:0x4156,sm:0x420A,sz:1,cap:0,b:1744,mi:96,kg:141,gmn:95,gmx:151},
    {n:"Lunastra",g:58,sub:0,sl:0x42C8,cp:0x40AC,lg:0x4160,sm:0x4214,sz:1,cap:0,b:1740,mi:91,kg:121,gmn:86,gmx:130},
    {n:"Teostra",g:59,sub:0,sl:0x42CA,cp:0x40AE,lg:0x4162,sm:0x4216,sz:1,cap:0,b:1740,mi:88,kg:125,gmn:86,gmx:140},
    {n:"Lao-Shan Lung (base)",g:60,sub:0,sl:0x4256,cp:0x403A,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Ashen Lao-Shan Lung",g:60,sub:1,sl:0x42AC,cp:0x4090,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0,bold:1},
    {n:"Yama Tsukami",g:61,sub:0,sl:0x42BC,cp:0x40A0,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Black Fatalis",g:62,sub:0,sl:0x424C,cp:0x4030,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0},
    {n:"Crimson Fatalis",g:62,sub:1,sl:0x4290,cp:0x4074,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0,bold:1},
    {n:"White Fatalis",g:62,sub:1,sl:0x42D6,cp:0x40BA,lg:0,sm:0,sz:0,cap:0,b:0,mi:0,kg:0,gmn:0,gmx:0,bold:1},
  ];

  // All 90 internal array slots, for the Advanced (offset map) section.
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

  // ---- Hunter tab config ---------------------------------------------
  // Weapon usage: on-screen bar order (left->right). The save array is in a
  // different internal order; SCREEN[i] = ARRAY[WPN_PERM[i]].
  const WPN_SCREEN = ["Great Sword","Long Sword","Sword & Shield","Dual Blades","Hammer",
                      "Hunting Horn","Lance","Gunlance","Light Bowgun","Heavy Bowgun","Bow"];
  const WPN_PERM = [0,7,4,6,2,8,3,9,5,1,10];
  const WPN_BASE = 0x678E0;               // 11 x u16, quests-per-weapon
  // Which weapon lives at each internal array index (inverse of WPN_PERM).
  const WPN_INTERNAL = (function () { const a = new Array(11); WPN_PERM.forEach((idx, i) => { a[idx] = WPN_SCREEN[i]; }); return a; })();

  const FUND = { pokke: 0x69248, guild: 0x6924C, money: 0x69250 };   // three u32
  const PLAYTIME_OFF = 0x03FC8;           // u32, total seconds
  const GREETING_OFF = 0x672EC;           // UTF-16LE, NUL-terminated (may be fullwidth)
  const QUESTS = [                         // save order (w = byte width)
    { k: "Chief's Quests",         o: 0x672D8, w: 2 },
    { k: "Guild Hall \u2014 Low Rank",  o: 0x672DA, w: 2 },
    { k: "Guild Hall \u2014 High Rank", o: 0x672DC, w: 2 },
    { k: "Treasure Quests",        o: 0x672DE, w: 2 },
    { k: "Training School",        o: 0x672E0, w: 2 },
    { k: "Nekoht's Quests",        o: 0x672E2, w: 2 },
    { k: "Guild Hall \u2014 G Rank",    o: 0x672E4, w: 4 },
  ];
  const FELYNE_BASE = 0x67E48, FELYNE_STRIDE = 0x40, FELYNE_SLOTS = 9;

  // Group DATA into families: each parent row + its subspecies rows.
  const FAMS = (function () {
    const fams = []; let cur = null;
    DATA.forEach(r => { if (!r.sub) { cur = { rows: [r] }; fams.push(cur); } else cur.rows.push(r); });
    fams.forEach(f => { f.hasSize = f.rows.some(r => r.sz === 1); f.capturable = f.rows.some(r => r.cap === 1); });
    return fams;
  })();

  // ---- award ground truth (v0.9) --------------------------------------
  // Earned-flag bitset: 6 bytes @0x67400 = 48 bits, LSB-first, award order
  // 1A..1X then 2A..2X (bit i = award i). READ ONLY — the game regenerates
  // this cache on quest completion, so writing it grants nothing.
  const AWARDS_BASE = 0x67400;

  // 1O Rare Species Report — the 16-variant set proven sufficient in-game.
  // Golden Rajang, Rusted Kushala Daora and Yian Garuga (One-Eyed) are
  // proven NOT required and are deliberately absent. Ashen Lao-Shan Lung
  // IS required (proven) even though Rusted Kushala is not — not a slip.
  const RSR_NAMES = ["Pink Rathian", "Gold Rathian", "Azure Rathalos", "Silver Rathalos",
    "Blue Yian Kut-Ku", "Purple Gypceros", "Red Khezu", "Black Gravios", "White Monoblos",
    "Black Diablos", "Green Plesioth", "Plum Daimyo Hermitaur", "Terra Shogun Ceanataur",
    "Emerald Congalala", "Copper Blangonga", "Ashen Lao-Shan Lung"];
  const RSR_ROWS = DATA.filter(r => RSR_NAMES.indexOf(r.n) >= 0);

  // 1P Ecology Research Report — the 43 capturable monsters, captured@ only.
  // Diablos (0x4048) is one entry: base or One-Horned both land in that slot.
  const CAP43 = [
    0x402E, 0x4038, 0x403C, 0x4042, 0x4048, 0x404A, 0x404E, 0x4054, 0x4056, 0x4058,
    0x4060, 0x4062, 0x4064, 0x406A, 0x4076, 0x4078, 0x407A, 0x407C, 0x407E, 0x4080,
    0x4082, 0x4084, 0x4086, 0x4088, 0x408A, 0x408C, 0x408E, 0x4092, 0x4094, 0x4096,
    0x40B2, 0x40B4, 0x40C2, 0x40C6, 0x40C8, 0x40CE, 0x40D0, 0x40D2, 0x40D4, 0x40D6,
    0x40D8, 0x40DA, 0x40DE,
  ];

  // ---- state ----------------------------------------------------------
  let view = null;                 // DataView over the loaded save (read only)
  let filterMode = "crown";        // "all" | "crown" | "captured" | "sub" | "rsr"
  let awardFilter = "all";         // "all" | "incomplete"
  let fromAward = null;            // award name that sent us to the Monsters tab
  let showSizeCols = true;
  let showSlots = false;
  let showQstAdv = false;
  let showWpnAdv = false;
  let searchQuery = "";
  const $ = (id) => document.getElementById(id);

  // ---- helpers --------------------------------------------------------
  function setStatus(msg, kind) { const el = $("status"); el.textContent = msg; el.className = "status" + (kind ? " " + kind : ""); }
  const u16  = (o) => view.getUint16(o, true);
  const u32  = (o) => view.getUint32(o, true);
  const u8   = (o) => view.getUint8(o);
  const num  = (v) => v.toLocaleString();
  const cm   = (base, pct) => Math.round(base * pct / 100 * 10) / 10;
  const fmt  = (v) => v.toFixed(1);
  const hex  = (o) => "0x" + o.toString(16).toUpperCase();
  const esc  = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function looksLikeText(dv) { const c0 = dv.getUint8(0), h0 = dv.getUint8(1); return c0 >= 0x20 && c0 <= 0x7e && h0 === 0x00; }
  function readName(dv) { let nm = ""; for (let o = 0; o < 32; o += 2) { const ch = dv.getUint16(o, true); if (ch === 0) break; nm += String.fromCharCode(ch); } return nm; }

  // Read a whole family off the save: per-row counts + sizes + family Hunted total.
  function readFam(fam) {
    const rows = fam.rows.map(r => {
      const slain = u16(r.sl), cap = u16(r.cp), hasSize = r.sz === 1;
      const S = hasSize ? u16(r.sm) : 0, L = hasSize ? u16(r.lg) : 0;
      const present = hasSize && !(S === 0 && L === 0);
      return { r, slain, cap, total: slain + cap, S, L, hasSize, present };
    });
    return { rows, hunted: rows.reduce((a, x) => a + x.total, 0) };
  }

  // ---- cell renderers -------------------------------------------------
  // Card sizes = this record's own recorded smallest / largest (plain, no glow).
  function cardCell(x, val) {
    if (!x.hasSize) return '<span class="dash">----</span>';
    if (!x.present) return '<span class="szval na">&mdash;</span>';
    return `<span class="szval">${val}% (${fmt(cm(x.r.b, val))}cm)</span>`;
  }
  // Game min/max = family-wide extreme; always coloured (min red, max blue).
  function gameMinCell(x) {
    if (!x.hasSize) return '<span class="dash">----</span>';
    return `<span class="szmin">${x.r.gmn}% (${fmt(cm(x.r.b, x.r.gmn))}cm)</span>`;
  }
  function gameMaxCell(x) {
    if (!x.hasSize) return '<span class="dash">----</span>';
    return `<span class="szmax">${x.r.gmx}% (${fmt(cm(x.r.b, x.r.gmx))}cm)</span>`;
  }
  function crownBadges(x) {
    if (!x.hasSize) return '<span class="dash">----</span>';
    if (!x.present) return '<span class="badge norec">no record</span>';
    const d = x.r, out = [];
    if (x.S <= d.mi)  out.push('<span class="badge sc">small crown</span>');
    if (x.L >= d.kg)  out.push('<span class="badge bc">big crown</span>');
    if (x.S <= d.gmn) out.push(sizeBadge("minsz", "min size", d));
    if (x.L >= d.gmx) out.push(sizeBadge("maxsz", "max size", d));
    return out.join(" ") || '<span class="dash">none</span>';
  }
  // min-size / max-size tag. Subspecies (d.vs set) carry a corner info
  // bubble that expands on click/tap to say whether this form's game
  // range differs from, or matches, its base species.
  function sizeBadge(cls, label, d) {
    if (!d.vs) return `<span class="badge ${cls}">${label}</span>`;
    const note = d.vs === "diff"
      ? "This subspecies' min/max game size differs from the base species."
      : "This subspecies' min/max game size is the same as the base species.";
    return `<span class="badge ${cls} has-tip">${label}` +
      `<button type="button" class="sub-tip vs-${d.vs}" data-note="${esc(note)}" aria-label="${esc(note)}">i</button></span>`;
  }
  function caughtCell(x) {
    if (!x.r.cap) return "";
    return x.cap > 0 ? '<span class="caught-yes">&#10003;</span>' : '<span class="caught-no">&#10007;</span>';
  }

  // ---- row + table ----------------------------------------------------
  function rowHTML(fam, fx, i) {
    const r = fam.rows[i], x = fx.rows[i];
    const isBase = i === 0, hasSub = fam.rows.length > 1;
    const bold = isBase || r.bold;
    const capCell = r.cap ? String(x.cap) : '<span class="dash">----</span>';
    const numCell = isBase ? r.g : "";
    const nameCls = "mname" + (bold ? "" : " sub");
    let nameExtra = "";
    if (isBase && hasSub) {
      nameExtra = `<span class="subcount">+${fam.rows.length - 1} sub</span>` +
                  `<span class="fhunt">&#931; ${fx.hunted} hunted</span>`;
    }
    return `<tr class="mrow${isBase ? "" : " subrow"}">
      <td class="cardno">${numCell}</td>
      <td class="${nameCls}">${esc(r.n)}${nameExtra}</td>
      <td class="num">${x.slain}</td>
      <td class="num">${capCell}</td>
      <td class="num c-total">${x.total}</td>
      <td class="num szcol">${cardCell(x, x.S)}</td>
      <td class="num szcol">${cardCell(x, x.L)}</td>
      <td class="num szcol">${gameMinCell(x)}</td>
      <td class="num szcol">${gameMaxCell(x)}</td>
      <td class="szcol crowncell">${crownBadges(x)}</td>
      <td class="c-capchk caughtcell">${caughtCell(x)}</td>
      <td class="c-huntchk caughtcell">${x.total > 0 ? '<span class="caught-yes">&#10003;</span>' : '<span class="caught-no">&#10007;</span>'}</td>
    </tr>`;
  }

  function renderTable() {
    if (!view) return;
    $("montbl").className = "montbl mode-" + filterMode + (showSizeCols ? "" : " hide-size");
    const q = searchQuery.trim().toLowerCase();
    const rows = [];
    let crownDen = 0, bigC = 0, smallC = 0;
    let huntedRows = 0, capRows = 0, capDone = 0, subRows = 0, subHunted = 0;
    const rowMode = filterMode === "sub" || filterMode === "rsr";

    FAMS.forEach(fam => {
      const fx = readFam(fam);
      if (fam.hasSize) {
        crownDen++;
        let b = false, s = false;
        fam.rows.forEach((r, i) => {
          const x = fx.rows[i];
          if (!x.hasSize || !x.present) return;
          if (x.L >= r.kg) b = true;
          if (x.S <= r.mi) s = true;
        });
        if (b) bigC++;
        if (s) smallC++;
      }
      fam.rows.forEach((r, i) => {
        const x = fx.rows[i];
        if (x.total > 0) huntedRows++;
        if (r.cap === 1) { capRows++; if (x.cap > 0) capDone++; }
        if (r.sub === 1) { subRows++; if (x.total > 0) subHunted++; }
      });

      if (rowMode) {   // subspecies views list rows, not families — no base rows
        fam.rows.forEach((r, i) => {
          if (r.sub !== 1) return;
          if (filterMode === "rsr" && RSR_ROWS.indexOf(r) < 0) return;
          if (q && !r.n.toLowerCase().includes(q)) return;
          rows.push(rowHTML(fam, fx, i));
        });
        return;
      }
      if (filterMode === "crown" && !fam.hasSize) return;
      if (filterMode === "captured" && !fam.capturable) return;
      if (q && !fam.rows.some(r => r.n.toLowerCase().includes(q))) return;
      for (let i = 0; i < fam.rows.length; i++) rows.push(rowHTML(fam, fx, i));
    });
    $("tbody").innerHTML = rows.join("");

    // Stat lines: one per view, plus the award line where a view maps to one.
    const L = [];
    if (filterMode === "crown") {
      L.push(`${bigC + smallC} / ${crownDen * 2} total crowns`);
      L.push(`${bigC} / ${crownDen} big crowns`);
      L.push(`${smallC} / ${crownDen} small crowns`);
    } else if (filterMode === "captured") {
      L.push(`${capDone} / ${capRows} monsters captured`);
      L.push(`${count43()} / 43 for the Ecology Research Report`);
    } else if (filterMode === "sub") {
      L.push(`${subHunted} / ${subRows} hunted`);
      L.push(`${countRSR()} / 16 for the Rare Species Report`);
    } else if (filterMode === "rsr") {
      L.push(`${countRSR()} / 16 hunted`);
    } else {
      L.push(`${huntedRows} / ${DATA.length} monsters hunted`);
    }
    $("crownStat").innerHTML = L.map(t => `<div>${esc(t)}</div>`).join("");
  }

  // ---- advanced: raw 90-slot table ------------------------------------
  function renderSlots() {
    const wrap = $("advScroll");
    if (!showSlots || !view) { wrap.classList.add("hidden"); $("advBody").innerHTML = ""; return; }
    wrap.classList.remove("hidden");
    const cell = (o) => `${hex(o)} <span class="muted">${u16(o)}</span>`;
    $("advBody").innerHTML = SLOTS.map(s => {
      const dead = /unused|UNKNOWN/i.test(s.label);
      return `<tr class="${dead ? "slot-dead" : ""}">
        <td class="num">${s.id}</td><td>${esc(s.label)}</td>
        <td class="num">${cell(s.cp)}</td><td class="num">${cell(s.lg)}</td>
        <td class="num">${cell(s.sm)}</td><td class="num">${cell(s.sl)}</td>
      </tr>`;
    }).join("");
  }

  // ---- hunter tab -----------------------------------------------------
  // UTF-16LE string, fixed max byte length, NUL-terminated.
  function readStr(o, maxBytes) { let s = ""; for (let i = 0; i < maxBytes; i += 2) { const c = view.getUint16(o + i, true); if (c === 0) break; s += String.fromCharCode(c); } return s; }
  // Greeting: may be stored as fullwidth glyphs; fold them back to ASCII.
  function readGreeting(o) {
    let s = "";
    for (let i = 0; i < 512; i += 2) {
      const c = view.getUint16(o + i, true); if (c === 0) break;
      let a = c;
      if (c >= 0xFF01 && c <= 0xFF5E) a = c - 0xFEE0;
      else if (c === 0x3000) a = 0x20;
      s += String.fromCharCode(a);
    }
    return s;
  }
  function fmtPlaytime(secs) { const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60); return h.toLocaleString() + "h " + String(m).padStart(2, "0") + "m"; }

  function renderHunter() {
    if (!view) return;
    const name = readName(view) || "(unnamed)";
    const secs = u32(PLAYTIME_OFF);
    const greet = readGreeting(GREETING_OFF);

    // weapon usage in on-screen order
    const wvals = WPN_SCREEN.map((nm, i) => u16(WPN_BASE + WPN_PERM[i] * 2));
    const wmax = Math.max(1, ...wvals);
    const wmin = Math.min(...wvals);
    const wrange = wmax - wmin;
    const totalQ = wvals.reduce((a, b) => a + b, 0);
    const wbars = WPN_SCREEN.map((nm, i) => {
      const v = wvals[i], pct = Math.round(v / wmax * 100), top = v === wmax && v > 0;
      // fade intensity scales min->max: lowest = current .5 alpha, highest = full accent.
      const alpha = wrange > 0 ? 0.5 + 0.5 * (v - wmin) / wrange : 0.5;
      const bg = top ? "" : `background:rgba(202,161,83,${alpha.toFixed(3)});`;
      return `<div class="wbar-row">
        <div class="wbar-name">${esc(nm)}</div>
        <div class="wbar-track"><div class="wbar-fill${top ? " top" : ""}" style="width:${v > 0 ? Math.max(pct, 2) : 0}%;${bg}"></div></div>
        <div class="wbar-val num">${num(v)}</div></div>`;
    }).join("");

    let felyneRows = "";
    for (let i = 0; i < FELYNE_SLOTS; i++) {
      const rec = FELYNE_BASE + i * FELYNE_STRIDE;
      let empty = true;
      for (let b = 0; b < FELYNE_STRIDE; b++) { if (u8(rec + b) !== 0) { empty = false; break; } }
      if (empty) continue;
      const lvl = u8(rec + 0x03) + 1, atk = u16(rec + 0x04), def = u16(rec + 0x06);
      const leader = readStr(rec + 0x18, 16) || "\u2014";
      felyneRows += `<tr><td class="num">${i + 1}</td><td class="num">${lvl}</td><td class="num">${num(atk)}</td><td class="num">${num(def)}</td><td>${esc(leader)}</td></tr>`;
    }
    const felyneTbl = felyneRows
      ? `<table class="slottbl htbl"><thead><tr><th class="num">Slot</th><th class="num">Lv</th><th class="num">Attack</th><th class="num">Defense</th><th>First Leader</th></tr></thead><tbody>${felyneRows}</tbody></table>`
      : `<p class="ph-text">No Felyne comrades on this save.</p>`;

    $("hunterGrid").innerHTML = `
      <div class="hcard">
        <h3>Hunter</h3>
        <div class="hunter-name">${esc(name)}</div>
        <div class="stat" style="margin-top:14px;"><span class="k">Playtime</span><span class="v">${fmtPlaytime(secs)}</span></div>
      </div>
      <div class="hcard">
        <h3>Funds</h3>
        <div class="stat"><span class="k">Pokke Points</span><span class="v">${num(u32(FUND.pokke))}</span></div>
        <div class="stat"><span class="k">Guild Points</span><span class="v">${num(u32(FUND.guild))}</span></div>
        <div class="stat"><span class="k">Zenny</span><span class="v">${num(u32(FUND.money))}</span></div>
      </div>
      <div class="hcard span2">
        <h3>Weapon Usage</h3>
        <div class="wbars">${wbars}</div>
      </div>
      <div class="hcard span2">
        <h3>Guild Card Greeting</h3>
        ${greet ? `<p class="greeting">\u201C${esc(greet)}\u201D</p>` : `<p class="ph-text">No greeting set.</p>`}
      </div>
      <div class="hcard span2">
        <h3>Felyne Fighter Comrades</h3>
        <div class="htbl-wrap">${felyneTbl}</div>
      </div>`;
  }

  // in-game display order (Chief, Nekoht, GH Low, GH High, GH G, Treasure, Training)
  const QUEST_GAME_ORDER = [0, 5, 1, 2, 6, 3, 4];

  function renderQuests() {
    if (!view) return;
    const qrows = QUEST_GAME_ORDER.map(i => {
      const q = QUESTS[i];
      const v = q.w === 4 ? u32(q.o) : u16(q.o);
      return `<div class="stat"><span class="k">${esc(q.k)}</span><span class="v">${num(v)}</span></div>`;
    }).join("");
    const totalQ = WPN_SCREEN.reduce((a, nm, i) => a + u16(WPN_BASE + WPN_PERM[i] * 2), 0);
    $("questGrid").innerHTML = `
      <div class="hcard span2">
        <h3>Quest Records</h3>
        ${qrows}
        <div class="stat total"><span class="k">Total Quests</span><span class="v">${num(totalQ)}</span></div>
      </div>`;
  }

  function renderQuestsAdv() {
    const wrap = $("advQstScroll");
    if (!showQstAdv || !view) { wrap.classList.add("hidden"); $("advQstBody").innerHTML = ""; return; }
    wrap.classList.remove("hidden");
    $("advQstBody").innerHTML = QUESTS.map((q, j) => {
      const v = q.w === 4 ? u32(q.o) : u16(q.o);
      return `<tr><td class="num">${j}</td><td class="num">${hex(q.o)}</td><td class="num">u${q.w * 8}</td><td>${esc(q.k)}</td><td class="num">${num(v)}</td></tr>`;
    }).join("");
  }

  function renderWeaponsAdv() {
    const wrap = $("advWpnScroll");
    if (!showWpnAdv || !view) { wrap.classList.add("hidden"); $("advWpnBody").innerHTML = ""; return; }
    wrap.classList.remove("hidden");
    $("advWpnBody").innerHTML = WPN_INTERNAL.map((nm, j) => {
      const o = WPN_BASE + j * 2;
      return `<tr><td class="num">${j}</td><td class="num">${hex(o)}</td><td>${esc(nm)}</td><td class="num">${num(u16(o))}</td></tr>`;
    }).join("");
  }

  // ---- awards / completion tab ---------------------------------------
  // Equipment master table, loaded from 12_equipment_full_table.csv on init.
  // Map "cat:id" -> {isG, r9}. null until the CSV loads; scanBox falls back to
  // the embedded lookup below when the fetch fails (e.g. opened from file://).
  let equipTable = null;

  // Compact fallback lookup (generated from equipment_full_table.csv). Used ONLY when the
  // CSV fetch fails — e.g. opening index.html directly from disk (file://), where browsers
  // block same-directory fetches. Lists only the qualifying items per award.
  //   EMBED_G  : G-weapon ids by category (5 blademaster, 6 gunner)  — award 2V
  //   EMBED_R9 : rarity 9/10 armor ids by category (0 legs,1 head,2 body,3 arms,4 waist) — award 2W
  const EMBED_G = {
    5: [679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,724,725,726,727,728,729,731,732,816,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,849,850,851,852,853,854,855,856,857,859,860,861,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,999,1000,1001,1002,1003,1055,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108,1109,1110,1111,1112,1113,1114,1115,1116,1117,1118,1119,1120,1121,1122,1123,1124,1125,1126,1127,1128,1129,1130,1131,1132,1133,1134,1135,1136,1137,1138,1139,1140,1141,1142,1144,1145],
    6: [208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,225,226,227,228,229,230,231,268,269,270,271,272,273,274,276,277,278,279,280,281,282,283,284,285,286,287,288,292,294,295,298,306,308,309,323,327,340]
  };
  const EMBED_R9 = {
    0: [301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415],
    1: [316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,433,435],
    2: [300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415],
    3: [294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406],
    4: [292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404]
  };
  // Build the fallback Map once, on first use.
  let embedTableCache = null;
  function embedTable() {
    if (embedTableCache) return embedTableCache;
    const m = new Map();
    for (const cat in EMBED_G) EMBED_G[cat].forEach(id => m.set(cat + ":" + id, { isG: true, r9: false }));
    for (const cat in EMBED_R9) EMBED_R9[cat].forEach(id => {
      const k = cat + ":" + id, e = m.get(k);
      if (e) e.r9 = true; else m.set(k, { isG: false, r9: true });
    });
    embedTableCache = m;
    return m;
  }

  function parseCSV(text) {
    const rows = []; let f = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { f.push(cur); cur = ""; }
      else if (c === '\n') { f.push(cur); rows.push(f); f = []; cur = ""; }
      else if (c === '\r') { /* skip */ }
      else cur += c;
    }
    if (cur !== "" || f.length) { f.push(cur); rows.push(f); }
    return rows;
  }
  function loadEquipTable() {
    fetch("equipment_full_table.csv")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(txt => {
        const rows = parseCSV(txt), map = new Map();
        // header cols: 0 cat_code, 2 id, 10 G_weapon, 11 rarity_9or10
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i]; if (r.length < 12) continue;
          const cat = parseInt(r[0], 10), id = parseInt(r[2], 10);
          if (isNaN(cat) || isNaN(id)) continue;
          map.set(cat + ":" + id, { isG: r[10] === "Y", r9: r[11] === "Y" });
        }
        equipTable = map;
        if (!$("sec-awards").classList.contains("hidden")) renderAwards();
      })
      .catch(() => { equipTable = null; if (!$("sec-awards").classList.contains("hidden")) renderAwards(); });
  }

  // Scan the 1000-slot equipment box (BOX_BASE 0x00A8, 12-byte records).
  // Returns G-weapon count + per-armor-slot rarity-9/10 counts, or null.
  function scanBox() {
    const tbl = equipTable || embedTable();     // fall back to embedded lookup if CSV didn't load
    if (!view || !tbl) return null;
    const bytes = new Uint8Array(view.buffer);
    let g = 0; const arm = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (let i = 0; i < 1000; i++) {
      const o = 0xA8 + i * 12;
      if (!bytes[o]) continue;                 // empty slot
      const cat = bytes[o + 1];
      if (cat > 6) continue;                   // corrupt/cheated
      const rec = tbl.get(cat + ":" + u16(o + 2));
      if (!rec) continue;
      if ((cat === 5 || cat === 6) && rec.isG) g++;          // blademaster/gunner G weapon
      else if (cat <= 4 && rec.r9) arm[cat]++;               // legs/head/body/arms/waist rarity 9-10
    }
    return { g, arm };
  }

  const huntTotal = (sl, cp) => u16(sl) + u16(cp);

  // Layer A: the game's own earned flag for award i (0 = 1A .. 47 = 2X).
  const earnedBit = (i) => (u8(AWARDS_BASE + (i >> 3)) >> (i & 7)) & 1;
  // Layer B reconstructions.
  const countRSR = () => RSR_ROWS.reduce((a, r) => a + (u16(r.sl) + u16(r.cp) > 0 ? 1 : 0), 0);
  const count43  = () => CAP43.reduce((a, o) => a + (u16(o) > 0 ? 1 : 0), 0);
  // Crowns per MONSTER, any form counts, split big (1G) / small (1H).
  function crownAward() {
    let denom = 0, big = 0, small = 0;
    FAMS.forEach(fam => {
      if (!fam.hasSize) return;
      denom++;
      const fx = readFam(fam);
      let b = false, s = false;
      fam.rows.forEach((r, i) => {
        const x = fx.rows[i];
        if (!x.hasSize || !x.present) return;
        if (x.L >= r.kg) b = true;
        if (x.S <= r.mi) s = true;
      });
      if (b) big++;
      if (s) small++;
    });
    return { denom, big, small };
  }

  // All 48 awards in guild-card order (1A -> 1X, 2A -> 2X).
  // complete = requirement met OR earned bit set (awards are permanent).
  function buildAwards() {
    const box = scanBox(), cc = crownAward(), A = [];
    const add = (name, req, opt) => A.push(Object.assign({ name, req, idx: A.length }, opt || {}));

    add("Village Chief's Glove", "Clear all 1-2 Star Village (Elder) Quests");
    add("Village Chief's Hat", "Clear all 3-4 Star Village (Elder) Quests");
    add("Village Chief's Scarf", "Clear all 5 Star Village (Elder) Quests");
    add("Village Chief's Coat", "Clear all 6 Star (Urgent) Village Elder Quests");
    add("Mane Necklace", "Hunt a Kirin (slay or capture, any rank)", { bar: [huntTotal(0x428A, 0x406E) > 0 ? 1 : 0, 1] });
    add("Blood Onyx", "Hunt an Akantor", { bar: [huntTotal(0x42E0, 0x40C4) > 0 ? 1 : 0, 1] });
    add("King's Crown", "Earn a Gold Crown for each monster's big size", { bar: [cc.big, cc.denom], link: "crown" });
    add("Miniature Crown", "Earn a Gold Crown for each monster's small size", { bar: [cc.small, cc.denom], link: "crown" });
    add("Bronze Medal", "Clear all 1-2 Star Guild Hall Quests");
    add("Silver Medal", "Clear all 3-5 Star Guild Hall Quests");
    add("Gold Medal", "Clear all 6-8 Star Guild Hall Quests");
    add("Black Belt Badge", "Clear all Battle Training for every monster with every weapon");
    add("Expert Badge", "Clear all Special Training for every monster and weapon");
    add("Legend Badge", "Clear all Group Training for every monster and weapon");
    add("Rare Species Report", "Hunt all 16 rare species", { bar: [countRSR(), 16], link: "rsr" });
    add("Ecology Research Report", "Capture all 43 capturable monsters", { bar: [count43(), 43], link: "captured" });
    add("Azure Stone", "Complete the Mining Point +4 Renovation");
    add("Great Hornfly", "Complete the Insect Thicket +4 Renovation");
    add("Springnight Carp", "Complete the Fishing Pier +2 Renovation");
    add("Dosbiscus", "Complete the Field Row +2 Renovation");
    add("Grateful Letter", "Have any 5 hired Felyne Chefs at Level 9");
    add("Sage's Bracelet", "Complete every combination in the Combo List");
    add("Wyverian Artisan's Hammer", "Attain the \u201CWeapon\u201D title");
    add("Hunter's Progress", "Clear 20+ quests in each: Snowy Mountains, Jungle, Desert, Swamp, Forest & Hills, Volcano, Tower");
    add("Felyne Elder's Whiskers", "Clear all 7 Star Elder (Nekoht) Quests");
    add("Felyne Elder's Bell", "Clear all 8 Star Elder (Nekoht) Quests");
    add("Felyne Elder's Coat", "Clear all 9 Star Elder (Nekoht) Quests");
    add("Pokke Liquor Bottle", "Clear the Felyne Elder Akantor urgent \u201CRise to the Summit\u201D");
    add("Bronze Shield", "Clear all 1 Star G-rank Guild Hall Quests");
    add("Silver Shield", "Clear all 2 Star G-rank Guild Hall Quests");
    add("Gold Shield", "Clear all 3 Star G-rank Guild Hall Quests");
    add("Heaven & Earth Emblem", "Complete all Elder Quests and all Guild Hall Quests (incl. urgents)");
    add("Ring of Darkness", "Hunt a G-rank Black Fatalis");
    add("Bracelet of Prominence", "Hunt a G-rank Crimson Fatalis");
    add("Heavenly Crown", "Hunt a G-rank White Fatalis");
    add("Golden Fur Boots", "Hunt a G-rank Gold Rajang");
    add("North Star Diamond", "Hunt an Ukanlos", { bar: [huntTotal(0x42F8, 0x40DC) > 0 ? 1 : 0, 1] });
    add("Monster Hunter's Bracelet", "Clear all Epic Quests in Elder and the Guild Hall");
    add("Fighter's Badge", "Clear all G-rank Training for every monster and weapon");
    add("Guild Knight's Citation", "Clear 20+ quests in both the Fort and Town maps");
    add("Guild Bouquet", "Attain 1,000,000 Guild Points", { bar: [Math.min(u32(FUND.guild), 1000000), 1000000] });
    add("Adventurer's Helmet", "Attain all Rare Treasure Items and a Gold Crown for each Treasure Hunt map");
    add("Trenya's Flag", "Send Trenya on 100 expeditions at 1500 Pokke Points");
    add("Grand Felvine", "Possess a Felyne Comrade with all skills unlocked");
    add("Letter of Appreciation", "Possess 5 Felyne Comrades all with 5 Fondness Hearts");
    add("Wyvernian Artisan Card", "Possess 50 G-rank weapons of any type",
      box ? { bar: [Math.min(box.g, 50), 50], link: "equip" } : { pend: "Equipment table not loaded", link: "equip" });

    // 2W carries per-slot chips alongside its bar.
    const req2W = "Possess 5 each of rarity 9/10 Helmets, Plates, Gauntlets, Waists & Leggings";
    if (box) {
      const slots = [1, 2, 3, 4, 0], slotNames = ["Helmets", "Plates", "Gauntlets", "Waists", "Leggings"];
      const total = slots.reduce((a, c) => a + Math.min(box.arm[c], 5), 0);
      const chips = slots.map((c, i) => {
        const v = box.arm[c];
        return `<span class="slot-chip${v >= 5 ? " ok" : ""}">${slotNames[i]} <b>${v}/5</b></span>`;
      }).join("");
      add("Wyvernian Forger's Mitten", req2W, { bar: [total, 25], chips, link: "equip" });
    } else {
      add("Wyvernian Forger's Mitten", req2W, { pend: "Equipment table not loaded", link: "equip" });
    }
    add("Hunter's Advancement", "Clear 20+ quests in every map except Castle Schrade, Battleground, Snow Battleground, Small Arena, Water Arena");

    A.forEach(a => {
      a.earned = !!earnedBit(a.idx);
      a.met = !!a.bar && a.bar[0] >= a.bar[1];
      a.complete = a.met || a.earned;
      a.note = a.earned && !!a.bar && !a.met;   // earned once, save has since regressed
    });
    return A;
  }

  function awardHTML(a) {
    const cls = "award-row" + (a.complete ? " done" : "") + (a.bar ? "" : " pending");
    let prog;
    if (a.bar) {
      const cur = a.bar[0], need = a.bar[1], pct = need > 0 ? Math.min(cur / need, 1) * 100 : 0;
      prog =
        (a.note ? `<div class="award-note">Earned. Awards are permanent; the count below is just your save right now</div>` : "") +
        `<div class="pbar${a.met ? " full" : ""}"><div class="pbar-fill" style="width:${pct.toFixed(1)}%"></div>` +
        `<span class="pbar-label">${num(cur)} / ${num(need)}</span></div>` +
        (a.chips ? `<div class="slot-chips">${a.chips}</div>` : "");
    } else {
      prog = `<span class="award-pending">${esc(a.pend || "Not yet mapped")}</span>`;
    }
    const link = a.link
      ? `<button type="button" class="award-link" data-link="${a.link}" data-award="${esc(a.name)}">See details &rarr;</button>`
      : `<span class="award-link off">See details &rarr;</span>`;
    return `<div class="${cls}">
      <div class="award-info"><div class="award-name">${esc(a.name)}</div><div class="award-req">${esc(a.req)}</div>${link}</div>
      <div class="award-prog">${prog}</div>
    </div>`;
  }

  function renderAwards() {
    if (!view) return;
    const all = buildAwards();
    $("awardStat").textContent = `${all.filter(a => a.complete).length} / 48 complete`;
    const shown = awardFilter === "incomplete" ? all.filter(a => !a.complete) : all;
    $("awardList").innerHTML = shown.length
      ? shown.map(awardHTML).join("")
      : `<p class="ph-text">No incomplete awards &mdash; all 48 complete.</p>`;
  }

  // ---- sidebar sections ----------------------------------------------
  const PLACEHOLDERS = {
    items: "Item box & pouch contents are not decoded yet. Placeholder for a later pass.",
    equipment: "Equipped weapon, armor, and decorations are not decoded yet. Placeholder for a later pass.",
  };
  const LABELS = { hunter:"HUNTER", quests:"QUESTS", items:"ITEMS", equipment:"EQUIPMENT", awards:"AWARDS" };

  function selectSection(id) {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === id));
    const showHun = id === "hunter", showMon = id === "monsters", showAdv = id === "advanced", showQst = id === "quests", showAwd = id === "awards";
    const showPh = !showHun && !showMon && !showAdv && !showQst && !showAwd;
    $("sec-hunter").classList.toggle("hidden", !showHun);
    $("sec-quests").classList.toggle("hidden", !showQst);
    $("sec-awards").classList.toggle("hidden", !showAwd);
    $("sec-monsters").classList.toggle("hidden", !showMon);
    $("sec-advanced").classList.toggle("hidden", !showAdv);
    $("sec-placeholder").classList.toggle("hidden", !showPh);
    if (showHun) renderHunter();
    if (showQst) renderQuests();
    if (showAwd) renderAwards();
    if (showPh) { $("phTitle").textContent = LABELS[id] || ""; $("phText").textContent = PLACEHOLDERS[id] || ""; }
  }

  // ---- drag-to-scroll (axis-locked; wheel still works) ----------------
  // The "from award" chip only clears on click or on unloading the save.
  function clearFromAward() { fromAward = null; $("fromAward").classList.add("hidden"); }
  let drag = null;
  function initDragScroll(el) {
    el.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest("input, select, textarea, button, a, label")) return;
      e.preventDefault(); e.stopPropagation();
      drag = { el, startX: e.clientX, startY: e.clientY, sl: el.scrollLeft, st: el.scrollTop, axis: null };
      el.style.cursor = "grabbing";
    });
  }
  window.addEventListener("mousemove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (!drag.axis && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (drag.axis === "x") drag.el.scrollLeft = drag.sl - dx;
    else if (drag.axis === "y") drag.el.scrollTop = drag.st - dy;
  });
  window.addEventListener("mouseup", () => {
    if (drag) drag.el.style.cursor = "grab";
    drag = null;
  });

  // ---- screen switching ----------------------------------------------
  // Four full-screen states: "drop" | "loading" | "picker" | "app".
  function showScreen(name) {
    $("dropScreen").classList.toggle("hidden", name !== "drop");
    $("loadingScreen").classList.toggle("hidden", name !== "loading");
    $("pickerScreen").classList.toggle("hidden", name !== "picker");
    $("app").classList.toggle("hidden", name !== "app");
  }

  // ---- load a decrypted 438,528-byte slot (read only) -----------------
  function loadBuffer(buf) {
    if (buf.byteLength !== EXPECT) {
      setStatus(`Rejected: ${buf.byteLength.toLocaleString()} bytes, expected ${EXPECT.toLocaleString()}. Not a decrypted MHP2G save.`, "bad");
      return false;
    }
    const dv = new DataView(buf);
    if (!looksLikeText(dv)) {
      setStatus("Rejected: file looks still-encrypted. Decrypt it first (PPSSPP / SaveTools).", "bad");
      return false;
    }
    view = dv;
    const nm = readName(dv) || "(unnamed)";
    $("charname").textContent = nm;
    selectSection("monsters");
    renderTable();
    renderSlots();
    renderWeaponsAdv();
    renderQuestsAdv();
    showScreen("app");
    return true;
  }

  /* ============================================================
     >>> EMBEDDED SAVETOOLS DECRYPTOR — VIEWER GLUE (BEGIN) <<<
     Everything between these fences is the bridge between the drop
     screen and the decryptor module (decryptor.js). The viewer's
     own read-only parsing above is untouched; this only routes a
     raw MHP2NDG.BIN through MHFUDecryptor and then hands the chosen
     438,528-byte slot to loadBuffer() exactly like a dropped .sav.
     ============================================================ */
  let decryptedSlots = null;    // [{name, bytes(Uint8Array 438528), empty}] x3
  let decryptedRegion = null;   // "US/EU" | "JP"

  // Decide what a dropped file is, purely by size, and route it.
  function handleFile(file) {
    const r = new FileReader();
    r.onerror = () => setStatus("Could not read the file.", "bad");
    r.onload = () => {
      const buf = r.result, size = buf.byteLength;
      if (size === EXPECT) {                 // already-decrypted characterX.sav -> unchanged path
        loadBuffer(buf);
      } else if (typeof MHFUDecryptor !== "undefined" &&
                 (size === MHFUDecryptor.SIZE_PSP_ENC || size === MHFUDecryptor.SIZE_PSP_DEC)) {
        startDecrypt(buf);                   // raw MHP2NDG.BIN -> decrypt in browser
      } else {
        setStatus(`Rejected: ${size.toLocaleString()} bytes. Drop a raw MHP2NDG.BIN ` +
          `(1,483,024 or 1,483,008 bytes) or a decrypted characterX.sav (438,528 bytes).`, "bad");
      }
    };
    r.readAsArrayBuffer(file);
  }

  // Show the loading screen for a ~3s minimum, decrypt, then show the picker.
  // The decrypt itself is near-instant; the delay is a deliberate cosmetic floor.
  const LOADING_FLOOR_MS = 3000;
  function startDecrypt(buf) {
    setStatus("", "");
    showScreen("loading");
    const t0 = Date.now();
    // yield one frame so the loading screen paints before the (synchronous) decrypt blocks the thread
    setTimeout(() => {
      let res;
      try { res = MHFUDecryptor.decryptBIN(new Uint8Array(buf)); }
      catch (e) { res = { ok: false, error: "Decryption error: " + (e && e.message ? e.message : e) }; }
      const wait = Math.max(0, LOADING_FLOOR_MS - (Date.now() - t0));
      setTimeout(() => finishDecrypt(res), wait);
    }, 60);
  }

  function finishDecrypt(res) {
    if (!res || !res.ok) {
      showScreen("drop");
      setStatus((res && res.error) || "Decryption failed.", "bad");
      return;
    }
    decryptedSlots = res.slots;
    decryptedRegion = res.region;
    buildPicker(res);
    showScreen("picker");
  }

  // Render the 3 slot cards; empty slots are shown as [empty] and disabled.
  function buildPicker(res) {
    $("pickRegion").textContent = res.region;
    $("pickStatus").textContent = "";
    const wrap = $("slotCards");
    wrap.innerHTML = "";
    res.slots.forEach((slot, i) => {
      const btn = document.createElement("button");
      btn.className = "slot-card" + (slot.empty ? " empty" : "");
      btn.disabled = slot.empty;
      btn.innerHTML = `<span class="slot-num">${i + 1}</span>` +
        `<span class="slot-name">${slot.empty ? "[empty]" : esc(slot.name || "(unnamed)")}</span>`;
      if (!slot.empty) btn.addEventListener("click", () => pickSlot(i));
      wrap.appendChild(btn);
    });
  }

  // Hand the chosen slot's 438,528 bytes to the normal viewer path.
  function pickSlot(i) {
    const slot = decryptedSlots && decryptedSlots[i];
    if (!slot || slot.empty) return;
    const fresh = slot.bytes.slice();       // own ArrayBuffer, offset 0, length 438528
    if (!loadBuffer(fresh.buffer)) {
      $("pickStatus").textContent = "That slot could not be read.";
      $("pickStatus").className = "status bad";
    }
  }
  /* >>> EMBEDDED SAVETOOLS DECRYPTOR — VIEWER GLUE (END) <<< */

  // ---- wiring ---------------------------------------------------------
  function init() {
    const drop = $("drop"), fileInput = $("file");
    drop.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
    ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("hover"); }));
    ["dragleave", "drop"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove("hover"); }));
    drop.addEventListener("drop", ev => { const f = ev.dataTransfer.files[0]; if (f) handleFile(f); });

    document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => selectSection(b.dataset.section)));
    // Subspecies size-tag info bubbles: a body-level floating popup so it
    // escapes the table's scroll clipping and never reflows the row.
    const tipPop = document.createElement("div");
    tipPop.className = "sub-tip-pop hidden";
    document.body.appendChild(tipPop);
    let tipOpenEl = null;
    function closeTip() { tipPop.classList.add("hidden"); if (tipOpenEl) { tipOpenEl.classList.remove("open"); tipOpenEl = null; } }
    function openTip(btn) {
      tipPop.textContent = btn.dataset.note || "";
      tipPop.className = "sub-tip-pop " + (btn.classList.contains("vs-same") ? "is-same" : "is-diff");
      const r = btn.getBoundingClientRect(), pw = tipPop.offsetWidth, ph = tipPop.offsetHeight;
      let left = r.right - pw;
      if (left + pw > window.innerWidth - 8) left = window.innerWidth - 8 - pw;
      if (left < 8) left = 8;
      let top = r.bottom + 6;
      if (top + ph > window.innerHeight - 8) top = r.top - ph - 6;
      tipPop.style.left = left + "px"; tipPop.style.top = top + "px";
      btn.classList.add("open"); tipOpenEl = btn;
    }
    $("montbl").addEventListener("click", (e) => {
      const btn = e.target.closest(".sub-tip");
      if (!btn) return;
      e.stopPropagation();
      if (tipOpenEl === btn) { closeTip(); return; }
      closeTip(); openTip(btn);
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".sub-tip")) closeTip(); });
    $("tableScroll").addEventListener("scroll", closeTip);
    $("content").addEventListener("scroll", closeTip);
    window.addEventListener("scroll", closeTip, true);
    window.addEventListener("resize", closeTip);
    function unloadToStart() {
      if (!window.confirm("Return to the start screen? The current character will be unloaded.")) return;
      view = null;
      clearFromAward();
      decryptedSlots = null;
      decryptedRegion = null;
      setStatus("", "");
      showScreen("drop");
    }
    $("brandHome").addEventListener("click", unloadToStart);
    $("changeSave").addEventListener("click", unloadToStart);
    $("pickBack").addEventListener("click", () => {
      decryptedSlots = null;
      decryptedRegion = null;
      setStatus("", "");
      showScreen("drop");
    });

    $("search").addEventListener("input", e => { searchQuery = e.target.value; renderTable(); });
    $("filterMode").addEventListener("change", e => { filterMode = e.target.value; renderTable(); });
    $("awardFilter").addEventListener("change", e => { awardFilter = e.target.value; renderAwards(); });

    // "See details" — jump to the tab that holds the underlying data, with
    // the matching view selected, and leave a chip to get back.
    $("awardList").addEventListener("click", e => {
      const b = e.target.closest("button.award-link");
      if (!b) return;
      const kind = b.dataset.link;
      if (kind === "equip") { selectSection("equipment"); return; }
      filterMode = kind === "crown" ? "crown" : kind === "rsr" ? "rsr" : "captured";
      $("filterMode").value = filterMode;
      fromAward = b.dataset.award || "";
      $("fromAward").textContent = "\u2190 Back to Awards \u00B7 " + fromAward;
      $("fromAward").classList.remove("hidden");
      selectSection("monsters");
      renderTable();
    });
    $("fromAward").addEventListener("click", () => { clearFromAward(); selectSection("awards"); });
    $("showSize").addEventListener("change", e => { showSizeCols = e.target.checked; renderTable(); });
    $("showSlots").addEventListener("change", e => { showSlots = e.target.checked; renderSlots(); });
    $("showQstAdv").addEventListener("change", e => { showQstAdv = e.target.checked; renderQuestsAdv(); });
    $("showWpnAdv").addEventListener("change", e => { showWpnAdv = e.target.checked; renderWeaponsAdv(); });

    initDragScroll($("content"));
    initDragScroll($("tableScroll"));
    initDragScroll($("advScroll"));

    loadEquipTable();
  }

  init();
})();
