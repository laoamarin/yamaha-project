/**
 * Official Sunday 5 Jul 2026 performance schedule.
 * Source: YAMAHA COSMIC CONCERT 2026 timetable (5 ก.ค. 2569).
 */
export type ScheduleStudent = {
  full_name: string;
  nickname?: string | null;
  teacher_name: string;
  slot?: string;
  order?: number;
  song?: string;
};

export const EVENT_NAME = "Yamaha Cosmic Concert 2026 - 5 ก.ค.";
export const EVENT_DATE = "2026-07-05";

/** Resolved at runtime by sync script */
export let EVENT_ID = "";

export function setEventId(id: string) {
  EVENT_ID = id;
}

export const SCHEDULE_STUDENTS: ScheduleStudent[] = [
  // ── 09:15 (9) ──
  {
    slot: "09:15",
    order: 1,
    full_name: "ด.ช.ณธัชพงศ์ ขรรค์วิไลกุล",
    teacher_name: "ครูพัทธ์",
    song: "Brazil",
  },
  {
    slot: "09:15",
    order: 2,
    full_name: "ด.ช.พลภัตม์ ศิริสวัสดิ์",
    teacher_name: "ครูพัทธ์",
    song: "The Woodcutter",
  },
  {
    slot: "09:15",
    order: 3,
    full_name: "ด.ช.กานต์ รักช้อน",
    teacher_name: "ครูพัทธ์",
    song: "Woops , I Swallowed a Ca1",
  },
  {
    slot: "09:15",
    order: 4,
    full_name: "ด.ช.ไลโอเนล กอฟฟิน",
    teacher_name: "ครูพัทธ์",
    song: "Minut",
  },
  {
    slot: "09:15",
    order: 5,
    full_name: "ด.ช.ณวรรธน์ปกรณ์ เอกวานิช",
    teacher_name: "ครูพัทธ์",
    song: "LET IT BEE",
  },
  {
    slot: "09:15",
    order: 6,
    full_name: "ด.ช. พรสัณห์ ธีระเพียร",
    teacher_name: "ครูพัทธ์",
    song: "Dewdrops",
  },
  {
    slot: "09:15",
    order: 7,
    full_name: "ด.ญ.แคทธรินโรส เพอคิส",
    nickname: "เคธี่",
    teacher_name: "ครูอ้อ",
    song: "Asain Princess",
  },
  {
    slot: "09:15",
    order: 8,
    full_name: "ด.ญ.ปุญญาภา กิตติธรกุล",
    nickname: "ไอริ",
    teacher_name: "ครูอ้อ",
    song: "Minuet",
  },
  {
    slot: "09:15",
    order: 9,
    full_name: "ด.ญ.วาทศิกานต์ จันทร์สัทธรรม",
    nickname: "แวววา",
    teacher_name: "ครูฝน",
    song: "Sonata",
  },

  // ── 10:15 (9) ──
  {
    slot: "10:15",
    order: 1,
    full_name: "ด.ญ.รณิดา ข่ายม่าน",
    teacher_name: "ครูพัทธ์",
    song: "Ayura",
  },
  {
    slot: "10:15",
    order: 2,
    full_name: "ด.ช.ณัฐวัฒน์ วิโรจไกรสิน",
    teacher_name: "ครูพัทธ์",
    song: "Hansel and Gretel",
  },
  {
    slot: "10:15",
    order: 3,
    full_name: "ด.ญ.อิสรีย์ วิโรจไกรสิน",
    teacher_name: "ครูพัทธ์",
    song: "Kleine Prelude Nr.1 Bwv.91",
  },
  {
    slot: "10:15",
    order: 4,
    full_name: "ด.ญ.ตมิสา กังวานตระกูล",
    nickname: "มิสา",
    teacher_name: "ครูอ้อ",
    song: "Minuet",
  },
  {
    slot: "10:15",
    order: 5,
    full_name: "ด.ช.ธกฤษฎ์ เมฆารักษ์กุล",
    nickname: "เก้า",
    teacher_name: "ครูอ้อ",
    song: "Alla Turca",
  },
  {
    slot: "10:15",
    order: 6,
    full_name: "ด.ญ.อัครมา ทองเกลี้ยง",
    nickname: "อองฟอง",
    teacher_name: "ครูอ้อ",
    song: "Canon in C",
  },
  {
    slot: "10:15",
    order: 7,
    full_name: "ด.ช. กิตติภัท วังกานนท์",
    nickname: "ภัท",
    teacher_name: "ครูแนน",
  },
  {
    slot: "10:15",
    order: 8,
    full_name: "ด.ญ.จีรัชยา สุขบรรจง",
    nickname: "พรรณไม้",
    teacher_name: "ครูแนน",
  },
  {
    slot: "10:15",
    order: 9,
    full_name: "ด.ญ.อลิสา ไชยารักษ์",
    nickname: "อลิส",
    teacher_name: "ครูแนน",
  },

  // ── 11:15 (12 unique students) ──
  {
    slot: "11:15",
    order: 1,
    full_name: "ด.ญ.พิญดา ใจรักสกุลหลี",
    teacher_name: "ครูพัทธ์",
    song: "The Kangaroo",
  },
  {
    slot: "11:15",
    order: 2,
    full_name: "ด.ญ.รมิดา วัชรเดชวิรุณโชติ",
    teacher_name: "ครูพัทธ์",
    song: "A Trapeze",
  },
  {
    slot: "11:15",
    order: 3,
    full_name: "ด.ช.ธีรธนัฐ วัชรเดชวิรุณโชติ",
    teacher_name: "ครูพัทธ์",
    song: "A Gorilla",
  },
  {
    slot: "11:15",
    order: 4,
    full_name: "ด.ช.วรภัทร อักษรธิดี",
    teacher_name: "ครูพัทธ์",
    song: "Happy Day",
  },
  {
    slot: "11:15",
    order: 5,
    full_name: "ด.ช.ณธูพร ดำสุวรรณ",
    teacher_name: "ครูพัทธ์",
    song: "Little Brow jug",
  },
  {
    slot: "11:15",
    order: 6,
    full_name: "ด.ช.ภากร สมัครพงศ์",
    teacher_name: "ครูพัทธ์",
    song: "Joyful Night",
  },
  {
    slot: "11:15",
    order: 7,
    full_name: "ด.ช.สรรวิชญ์ วันแจ่ม",
    teacher_name: "ครูพัทธ์",
    song: "Lullaby",
  },
  {
    slot: "11:15",
    order: 8,
    full_name: "ด.ญ.ชัญญภัทร โล่ห์แก้ว",
    nickname: "อัญชัน",
    teacher_name: "ครูอ้อ",
    song: "Lone Connecto",
  },
  {
    slot: "11:15",
    order: 9,
    full_name: "ด.ญ.ขวัญมุก ตัณฑเวส",
    nickname: "มุก",
    teacher_name: "ครูอ้อ",
    song: "Canon in D",
  },
  {
    slot: "11:15",
    order: 10,
    full_name: "ด.ญ.ภารดี นิธิบุญปกรณ์",
    nickname: "อัลมอนด์",
    teacher_name: "ครูแนน",
  },
  {
    slot: "11:15",
    order: 11,
    full_name: "ด.ญ.ณัฏฐากาญจน์ เอื้อกฤดาธิการ",
    nickname: "ลิลลี่",
    teacher_name: "ครูแนน",
  },
  {
    slot: "11:15",
    order: 12,
    full_name: "ด.ญ.Athena Hongsuok",
    nickname: "Athena",
    teacher_name: "ครูฝน",
    song: "Juggling Jellybean",
  },

  // ── 13:15 (9) ──
  {
    slot: "13:15",
    order: 1,
    full_name: "ด.ช.ไทเฮ หว่อง",
    teacher_name: "ครูพัทธ์",
    song: "Alla Bazh",
  },
  {
    slot: "13:15",
    order: 2,
    full_name: "ด.ช.หย่อยเฮ หว่อง",
    teacher_name: "ครูพัทธ์",
    song: "Romance",
  },
  {
    slot: "13:15",
    order: 3,
    full_name: "ด.ช.อธิษฐ์ ทองแก้ว",
    teacher_name: "ครูพัทธ์",
    song: "Romance",
  },
  {
    slot: "13:15",
    order: 4,
    full_name: "ด.ช.วชิรพงศ์ สงดำ",
    teacher_name: "ครูพัทธ์",
    song: "The Kangaroo",
  },
  {
    slot: "13:15",
    order: 5,
    full_name: "ด.ช.กันตพิชญ์ ทรายทอง",
    nickname: "กันต์",
    teacher_name: "ครูอ้อ",
    song: "Minuet // The Entertainer",
  },
  {
    slot: "13:15",
    order: 6,
    full_name: "ด.ญ.พราวพิชชา ดำใหม่",
    nickname: "กีวี่",
    teacher_name: "ครูอ้อ",
    song: "Fur Elise",
  },
  {
    slot: "13:15",
    order: 7,
    full_name: "ด.ช.ภูผา อุดมกิจ",
    nickname: "ภูผา",
    teacher_name: "ครูอ้อ",
    song: "Always with me",
  },
  {
    slot: "13:15",
    order: 8,
    full_name: "ด.ญ.ขวัญข้าว ปะจันทบุตร",
    nickname: "พรีม",
    teacher_name: "ครูแนน",
  },
  {
    slot: "13:15",
    order: 9,
    full_name: "ด.ญ.MYRA NARANG",
    teacher_name: "ครูแนน",
  },

  // ── 14:15 (12) ──
  {
    slot: "14:15",
    order: 1,
    full_name: "ด.ช.ธีรเมท เอี่ยมวิวัฒนากุล",
    teacher_name: "ครูพัทธ์",
    song: "My Bonny Lad",
  },
  {
    slot: "14:15",
    order: 2,
    full_name: "ด.ช.วรากร ผาสิงห์",
    teacher_name: "ครูพัทธ์",
    song: "Sing",
  },
  {
    slot: "14:15",
    order: 3,
    full_name: "ด.ช.วิณณ์ วรวีรกุล",
    teacher_name: "ครูพัทธ์",
    song: "Gavatte",
  },
  {
    slot: "14:15",
    order: 4,
    full_name: "ด.ช.เหิงอัน จาง",
    teacher_name: "ครูพัทธ์",
    song: "Angel's Sung",
  },
  {
    slot: "14:15",
    order: 5,
    full_name: "ด.ญ.ณิชชา สุขสมบูรณ์",
    teacher_name: "ครูพัทธ์",
    song: "A Happy Day",
  },
  {
    slot: "14:15",
    order: 6,
    full_name: "ด.ช.อรุณวิทย์ ฤกษ์อรุณวิทยา",
    teacher_name: "ครูพัทธ์",
    song: "Fly Far Spaceship!",
  },
  {
    slot: "14:15",
    order: 7,
    full_name: "ด.ญ.ศุจินธร ขันตีสรรพังหลวง",
    nickname: "แพรวา",
    teacher_name: "ครูอ้อ",
    song: "Kiss The Rain",
  },
  {
    slot: "14:15",
    order: 8,
    full_name: "ด.ญ.รินลดา ตันเถียร",
    nickname: "หยูอี้",
    teacher_name: "ครูอ้อ",
    song: "Evening Star",
  },
  {
    slot: "14:15",
    order: 9,
    full_name: "ด.ญ.พรณิชา มีสวัสดิ์",
    nickname: "หนูดี",
    teacher_name: "ครูอ้อ",
    song: "Sonata No.16",
  },
  {
    slot: "14:15",
    order: 10,
    full_name: "ด.ญ.พสชนันท์ ประวงษ์รัตน์",
    nickname: "ปาล์มมี่",
    teacher_name: "ครูอ้อ",
    song: "Canon in D",
  },
  {
    slot: "14:15",
    order: 11,
    full_name: "ด.ช.ธนคินทร์ ฐิติพฤฒิกุล",
    nickname: "เวกัส",
    teacher_name: "ครูอ้อ",
    song: "The Entertainer",
  },
  {
    slot: "14:15",
    order: 12,
    full_name: "ด.ญ.นลินา วรวีรกุล",
    nickname: "นลิน",
    teacher_name: "ครูแนน",
  },

  // ── 15:15 (13) ──
  {
    slot: "15:15",
    order: 1,
    full_name: "ด.ช.กิตติกวิน สัตย์พิทักษ์",
    teacher_name: "ครูพัทธ์",
    song: "Everybody, let's go 1,2,3",
  },
  {
    slot: "15:15",
    order: 2,
    full_name: "ด.ญ.ญาณิสรา นวกุลโกมล",
    teacher_name: "ครูพัทธ์",
    song: "The Hut on the Alp",
  },
  {
    slot: "15:15",
    order: 3,
    full_name: "ด.ช.ญาณากริช นวกุลโกมล",
    teacher_name: "ครูพัทธ์",
    song: "Twinkle Little Star",
  },
  {
    slot: "15:15",
    order: 4,
    full_name: "ด.ช.วิมินทร์ ยอแสงรัตน์",
    teacher_name: "ครูพัทธ์",
    song: "Rainbow",
  },
  {
    slot: "15:15",
    order: 5,
    full_name: "ด.ช.อิซอาน วานิ",
    teacher_name: "ครูพัทธ์",
    song: "My Grandpa and I",
  },
  {
    slot: "15:15",
    order: 6,
    full_name: "ด.ช.แสน ลิ้มสกุล",
    teacher_name: "ครูพัทธ์",
    song: "แผ่นดินของเรา",
  },
  {
    slot: "15:15",
    order: 7,
    full_name: "ด.ญ.ปัณณ์ โกยสมบัติ",
    teacher_name: "ครูพัทธ์",
    song: "ALL THE THINGS YOU ARE",
  },
  {
    slot: "15:15",
    order: 8,
    full_name: "ด.ช.มนกร บุญยกิตานนท์",
    nickname: "ธีร์",
    teacher_name: "ครูอ้อ",
    song: "River Flows in You",
  },
  {
    slot: "15:15",
    order: 9,
    full_name: "ด.ช.ณมนกร บุญยกิตานนท์",
    nickname: "ธาม",
    teacher_name: "ครูอ้อ",
    song: "Lullaby",
  },
  {
    slot: "15:15",
    order: 10,
    full_name: "ด.ช.จักรรพงศ์ วงศ์พาณิชย์",
    nickname: "อู๋ฮั่น",
    teacher_name: "ครูอ้อ",
    song: "Canon in D",
  },
  {
    slot: "15:15",
    order: 11,
    full_name: "ด.ญ.สมิตา พักบางยง",
    nickname: "ข้าวสวย",
    teacher_name: "ครูแนน",
  },
  {
    slot: "15:15",
    order: 12,
    full_name: "ด.ญ.สุปรียา พักบางยง",
    nickname: "ข้าวใหม่",
    teacher_name: "ครูแนน",
  },
  {
    slot: "15:15",
    order: 13,
    full_name: "น.ส.ประภาพร ศรีเมือง",
    nickname: "เฟี้ยส",
    teacher_name: "ครูแนน",
  },
];
