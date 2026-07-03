import {
  getCertificateDisplayName,
  parseCertificateNameSource,
  stripHonorificPrefix,
} from "../src/lib/certificate-name";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function testGetCertificateDisplayName() {
  const thaiStudent = {
    full_name: "ด.ช.สมชาย ใจดี",
    nickname: "ชาย",
  };

  assert(
    getCertificateDisplayName(thaiStudent) === "ด.ช.สมชาย ใจดี",
    "default full_name"
  );
  assert(
    getCertificateDisplayName(thaiStudent, "no_prefix") === "สมชาย ใจดี",
    "event default no_prefix"
  );
  assert(
    getCertificateDisplayName(
      { ...thaiStudent, certificate_name_source: "nickname" },
      "full_name"
    ) === "ชาย",
    "student override nickname"
  );
  assert(
    getCertificateDisplayName({
      full_name: "ด.ญ.Athena Hongsuok",
      nickname: "Athena",
      certificate_name_source: "no_prefix",
    }) === "Athena Hongsuok",
    "no_prefix strips honorific"
  );
  assert(
    getCertificateDisplayName({
      full_name: "ด.ญ.MYRA NARANG",
      certificate_name_source: "custom",
      certificate_name: "MYRA NARANG",
    }) === "MYRA NARANG",
    "custom name"
  );
  assert(
    getCertificateDisplayName({
      full_name: "ด.ญ.Test",
      nickname: null,
      certificate_name_source: "nickname",
    }) === "ด.ญ.Test",
    "nickname fallback to full_name"
  );
}

function testParseCertificateNameSource() {
  assert(parseCertificateNameSource("nickname") === "nickname", "english");
  assert(parseCertificateNameSource("ชื่อเล่น") === "nickname", "thai");
  assert(parseCertificateNameSource("no_prefix") === "no_prefix", "no_prefix");
  assert(parseCertificateNameSource("") === null, "empty");
  assert(parseCertificateNameSource("invalid") === null, "invalid");
}

function testStripHonorificPrefix() {
  assert(
    stripHonorificPrefix("ด.ญ.Athena Hongsuok") === "Athena Hongsuok",
    "ด.ญ."
  );
  assert(stripHonorificPrefix("นายทดสอบ ระบบ") === "ทดสอบ ระบบ", "นาย");
  assert(stripHonorificPrefix("MYRA NARANG") === "MYRA NARANG", "no prefix");
}

function main() {
  testStripHonorificPrefix();
  testParseCertificateNameSource();
  testGetCertificateDisplayName();
  console.log("✓ certificate-name smoke tests passed");
}

main();
