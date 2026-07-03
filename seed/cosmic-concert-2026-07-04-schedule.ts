/**
 * Official Saturday 4 Jul 2026 performance schedule (74 students).
 * Source: YAMAHA COSMIC CONCERT 2026 timetable.
 */
export type ScheduleStudent = {
  full_name: string;
  nickname?: string | null;
  teacher_name: string;
  slot?: string;
};

export const EVENT_ID = "57485cb8-d856-44f3-90cd-2e9e58e424ef";

export const SCHEDULE_STUDENTS: ScheduleStudent[] = [
  // 09:15
  { slot: "09:15", full_name: "ด.ช.นภัทร มหิมา", teacher_name: "ครูพัทธ์" },
  { slot: "09:15", full_name: "ด.ญ.กุลนาถ บัลนาลังก์", teacher_name: "ครูพัทธ์" },
  { slot: "09:15", full_name: "ด.ญ.มณพร บัลนาลังก์", teacher_name: "ครูพัทธ์" },
  { slot: "09:15", full_name: "ด.ญ.ณฐ บัลนาลังก์", teacher_name: "ครูพัทธ์" },
  { slot: "09:15", full_name: "ด.ช.กันต์กวี ชมสวน", teacher_name: "ครูพัทธ์" },
  { slot: "09:15", full_name: "ด.ญ.ศศิ อุ่นทานนท์", teacher_name: "ครูพัทธ์" },
  { slot: "09:15", full_name: "ด.ช.ปภัสสพนธ์ นิยมอดุลย์", nickname: "นาธี", teacher_name: "ครูอ้อ" },
  { slot: "09:15", full_name: "ด.ญ.อุรัสยา อ่อนคง", nickname: "หมิวหมิว", teacher_name: "ครูอ้อ" },
  { slot: "09:15", full_name: "ด.ญ.พิชญานิน ชูภักดิ์", nickname: "เบลล่า", teacher_name: "ครูแนน" },
  { slot: "09:15", full_name: "ด.ญ.ณฐา ทรัพย์ถนอม", nickname: "ปัญญ์", teacher_name: "ครูแนน" },
  { slot: "09:15", full_name: "ด.ช.นีร นวลใย", nickname: "นีร", teacher_name: "ครูฝน" },

  // 10:15
  { slot: "10:15", full_name: "ด.ช.Liang Shuang", teacher_name: "ครูพัทธ์" },
  { slot: "10:15", full_name: "ด.ช.วรินทร ชินนาพันธ์", teacher_name: "ครูพัทธ์" },
  { slot: "10:15", full_name: "ด.ช.ภีรติ ขณะถั่วทุ่ง", teacher_name: "ครูพัทธ์" },
  { slot: "10:15", full_name: "ด.ช.วรัญชิต พิรุณไพศาล", teacher_name: "ครูพัทธ์" },
  { slot: "10:15", full_name: "ด.ช.เวทน เพียรพานิช", teacher_name: "ครูพัทธ์" },
  { slot: "10:15", full_name: "ด.ญ.ยุราย ตันสกุล", nickname: "ชิโน", teacher_name: "ครูอ้อ" },
  { slot: "10:15", full_name: "ด.ญ.พชรา พงศาปาน", nickname: "ลีลี่", teacher_name: "ครูอ้อ" },
  { slot: "10:15", full_name: "ด.ญ.ชนมน บุญแสง", nickname: "ลลล", teacher_name: "ครูอ้อ" },
  { slot: "10:15", full_name: "ด.ญ.นพสร ตันชินศรี", nickname: "นท", teacher_name: "ครูแนน" },
  { slot: "10:15", full_name: "ด.ช.ธนกฤต สุนทรสิงห์", nickname: "แชม", teacher_name: "ครูแนน" },

  // 11:15
  { slot: "11:15", full_name: "ด.ญ.พิชากร เอ่งฉ้วน", teacher_name: "ครูพัทธ์" },
  { slot: "11:15", full_name: "ด.ญ.พิชชากร เอ่งฉ้วน", teacher_name: "ครูพัทธ์" },
  { slot: "11:15", full_name: "ด.ช.อิทธิกร ชูชื่อ", teacher_name: "ครูพัทธ์" },
  { slot: "11:15", full_name: "ด.ญ.อิสเบลล่า สันติเจริญชัย", nickname: "เบลล่า", teacher_name: "ครูอ้อ" },
  { slot: "11:15", full_name: "ด.ญ.อธิชา กระจงกลาง", nickname: "มุก", teacher_name: "ครูอ้อ" },
  { slot: "11:15", full_name: "ด.ญ.พีรดาพัฒน์ นาคทอง", nickname: "เทียร์", teacher_name: "ครูอ้อ" },
  { slot: "11:15", full_name: "ด.ญ.ไปรยา งานทวี", nickname: "ป่วนป่วน", teacher_name: "ครูแนน" },
  { slot: "11:15", full_name: "ด.ญ.พชิรา ธราพร", nickname: "ปริม", teacher_name: "ครูแนน" },
  { slot: "11:15", full_name: "ด.ช.กวิณ อุปัตถ์ถุงค์", nickname: "กวิณ", teacher_name: "ครูฝน" },
  { slot: "11:15", full_name: "ด.ญ.อัญญา ใจรักสกุลหลี", nickname: "จูเลีย", teacher_name: "ครูฝน" },
  { slot: "11:15", full_name: "ด.ญ.โซฟี แฮนสัน", nickname: "โซฟี", teacher_name: "ครูฝน" },
  { slot: "11:15", full_name: "ด.ช.คีตลักษณ์ เพ็งแก้ว", nickname: "คีตะ", teacher_name: "ครูฝน" },
  { slot: "11:15", full_name: "ด.ช.ฉัตรธวิชญ์ พันธ์เบญจพล", nickname: "ปก", teacher_name: "ครูฝน" },
  { slot: "11:15", full_name: "ด.ช.ฉัตรธวัชร์ พันธ์เบญจพล", nickname: "ป้อง", teacher_name: "ครูฝน" },
  { slot: "11:15", full_name: "ด.ญ.กัญญาภัทร เหวิน", nickname: "อแมนด้า", teacher_name: "ครูนก" },
  { slot: "11:15", full_name: "ด.ช.กฤติเดช เหวิน", nickname: "มาริโอ้", teacher_name: "ครูนก" },
  { slot: "11:15", full_name: "ด.ญ.La Wun Eain", teacher_name: "ครูนก" },

  // 13:15
  { slot: "13:15", full_name: "ด.ญ.กัญญารัตน์ ศุภรัตน์วรากุล", nickname: "โมริ", teacher_name: "ครูเมย์" },
  { slot: "13:15", full_name: "ด.ญ.ญาโณธิป หาญดีชีกุล", nickname: "ไอซา", teacher_name: "ครูเมย์" },
  { slot: "13:15", full_name: "ด.ญ.กาญ่า ฟันซามอเร่", nickname: "กาญ่า", teacher_name: "ครูเมย์" },
  { slot: "13:15", full_name: "ด.ญ.ลัลลลัล วงศ์นิรามัยกุล", nickname: "ลลัล", teacher_name: "ครูเมย์" },
  { slot: "13:15", full_name: "ด.ญ.ลัลลียา วงศ์นิรามัยกุล", nickname: "ลียา", teacher_name: "ครูเมย์" },
  { slot: "13:15", full_name: "ด.ช.รพี บูรณถาวรสม", nickname: "โอเล่", teacher_name: "ครูเมย์" },
  { slot: "13:15", full_name: "ด.ช.ภูมิภากร พงศ์ธนาพานิช", nickname: "ซัน", teacher_name: "ครูเมย์" },
  { slot: "13:15", full_name: "ด.ช.ภาสุ พงศ์พรรธาดา", nickname: "พฤกษ์", teacher_name: "ครูเมย์" },
  { slot: "13:15", full_name: "ด.ญ.ภัณฑิรา จันทร์ภิญโญภาพ", nickname: "อ่อมแอ๋ม", teacher_name: "ครูอ้อ" },
  { slot: "13:15", full_name: "ด.ญ.เปมิกา ระงับทุกข์", nickname: "ต้นปาล์ม", teacher_name: "ครูอ้อ" },
  { slot: "13:15", full_name: "ด.ญ.พัชโรชา เขียวคราม", nickname: "หยก", teacher_name: "ครูแนน" },
  { slot: "13:15", full_name: "ด.ญ.ฐิติชญา ทิพวงษ์", nickname: "เมล่อน", teacher_name: "ครูแนน" },

  // 14:15
  { slot: "14:15", full_name: "ด.ญ.รับขวัญ ประมวลสุข", nickname: "เพลินใจ", teacher_name: "ครูอ้อ" },
  { slot: "14:15", full_name: "ด.ญ.ธีรนาฏ ธรรมดี", nickname: "ลลินณ์", teacher_name: "ครูอ้อ" },
  { slot: "14:15", full_name: "ด.ช.กรกันต์ หมูกแก้ว", nickname: "ขุนเขา", teacher_name: "ครูอ้อ" },
  { slot: "14:15", full_name: "ด.ช.กรรณกร หมูกแก้ว", nickname: "ลูกคุณ", teacher_name: "ครูอ้อ" },
  { slot: "14:15", full_name: "ด.ช.นกร ไชยตะมาตย์", nickname: "เต้", teacher_name: "ครูอ้อ" },
  { slot: "14:15", full_name: "ด.ญ.ดุลย์รยา ศุภรัตน์วรากุล", nickname: "มิริน", teacher_name: "ครูแนน" },
  { slot: "14:15", full_name: "ด.ช.ณรากร ติลกมกรพงศ์", teacher_name: "ครูฝน" },
  { slot: "14:15", full_name: "ด.ญ.สุธีรัช รุ่งกำเนิดวงศ์", teacher_name: "ครูพัทธ์" },
  { slot: "14:15", full_name: "ด.ญ.ณฐพร ทองเกลี้ยง", teacher_name: "ครูพัทธ์" },
  { slot: "14:15", full_name: "ด.ญ.พิชญสิตางค์ สุวรรณรัตน์", teacher_name: "ครูพัทธ์" },
  { slot: "14:15", full_name: "ด.ช.อันดานิกกี้ ชูทอง", teacher_name: "ครูพัทธ์" },
  { slot: "14:15", full_name: "ด.ญ.โชติกา ลิ่มมานะกุล", teacher_name: "ครูพัทธ์" },
  { slot: "14:15", full_name: "ด.ญ.วรพรรณี ถิรวุธ", teacher_name: "ครูพัทธ์" },

  // 15:15
  { slot: "15:15", full_name: "ด.ช.วรากร ศิริพรหมพิทักษ์", teacher_name: "ครูพัทธ์" },
  { slot: "15:15", full_name: "ด.ญ.ภีรดา ณ นคร", teacher_name: "ครูพัทธ์" },
  { slot: "15:15", full_name: "ด.ช.ธาดา นาวารักษ์", teacher_name: "ครูพัทธ์" },
  { slot: "15:15", full_name: "น.ส.ปาริน ขันธกุล", teacher_name: "ครูพัทธ์" },
  { slot: "15:15", full_name: "ด.ช.ณัฐดนัย สนั่นเวียง", teacher_name: "ครูพัทธ์" },
  { slot: "15:15", full_name: "ด.ช.พชร ณ นคร", teacher_name: "ครูพัทธ์" },
  { slot: "15:15", full_name: "ด.ญ.ติณณ์ญาดา ค่าวิเศษณ์", teacher_name: "ครูพัทธ์" },
  { slot: "15:15", full_name: "ด.ช.วรพล สินไชย", nickname: "ปั้น", teacher_name: "ครูอ้อ" },
  { slot: "15:15", full_name: "ด.ญ.กุลชา สินไชย", nickname: "แป้ง", teacher_name: "ครูอ้อ" },
  { slot: "15:15", full_name: "น.ส.พิมพ์ชนก ทองใส", nickname: "พีค", teacher_name: "ครูอ้อ" },
  { slot: "15:15", full_name: "ด.ญ.ณภัทร ชัยเทพ", nickname: "ทับทิม", teacher_name: "ครูอ้อ" },
];
